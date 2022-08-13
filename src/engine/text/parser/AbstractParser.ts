// noinspection RegExpRedundantEscape

/*
 * Created by aimozg on 04.07.2022.
 */

import {LogManager} from "../../logging/LogManager";
import {Parsed, ParsedStyledText, walkParsedText} from "./Parsed";
import {Lexer} from "./Lexer";
import {adjustCaseMode, parseXmlEntity} from "../../utils/string";

const logger = LogManager.loggerFor("engine.text.parser.AbstractParser");

// Lookahead regexes
/** Plain text */
const LA_TEXT = /^[^\\\[<\n&]+/;
/** Line break */
const LA_BR = /^\n/;
/** HTML Entity */
const LA_ENTITY = /^&(?:\w+|#x[a-fA-F\d]+|#\d+);/;
/** Escaped control char */
const LA_ESCAPED = /^\\./;
/**
 * Simple `[parsertag]` or `[tag arguments]`.
 * Group 1 = tag name, group 2 = tag arguments (including any leading whitespace)
 */
const LA_SIMPLETAG = /^\[([\w-]+:?)([^\]]*)\]/;
/** Non-tag in square brackets like `[1]` */
const LA_FALSETAG = /^\[(?:\W|\\.)/;
/** Group 1 = tag name */
const LA_TAGSTART = /^\[(\w+)\b/;
/**
 * Group 1: tag name
 * Group 2: raw attributes string
 * Group 3: '/' or empty string before '>'
 */
const LA_HTMLTAGSTART = /^< *([\w\d:-]+) *((?: *[\w\d:_-]+(?: *=(?:"[^"]*"|'[^']*'|[\w\d_-]+))?)*) *(\/?)>/;
/** Group 1 : tag name */
const LA_HTMLTAGEND = /^<\/ *([\w\d:-]+) *>/;


export abstract class AbstractParser {

	protected allowedHtmlTags = new Set(["b", "i", "u", "p", "h1", "h2", "h3", "h4", "h5", "hr", "br", "span", "div", "sub", "sup", "em", "strong"]);

	protected abstract doEvaluateTag(tag: string, tagArgs: string): Parsed|string;
	protected evaluateHtmlTag(
		tag:string,
		attrs:string,
		single:boolean,
		current:Parsed[],
		push:(tag:string,list:Parsed[])=>void
	):void {
		if (tag === 'hr' && single) {
			current.push({type:'hr'});
		} else if (tag === 'br' && single) {
			current.push({type:'br'})
		} else if (this.allowedHtmlTags.has(tag)) {
			let block: ParsedStyledText = {
				type: "styledText",
				className: "text-" + tag,
				content: []
			}
			current.push(block);
			push(tag, block.content);
		} else {
			let error = `Unsupported HTML tag ${tag}`;
			logger.warn(error);
			current.push({type:"error", content:error});
		}
	}

	evaluateTag(tag: string, tagArgsRaw: string): Parsed {
		let content = this.doEvaluateTag(tag.toLowerCase(), tagArgsRaw);
		if (typeof content === 'string') content = {type:"group", content:this.parse(content)}
		switch (adjustCaseMode(tag)) {
			case "uppercase":
				walkParsedText(content, p => {
					p.content = p.content.toUpperCase();
				});
				break;
			case "capitalize": {
				let capd = false;
				walkParsedText(content, p => {
					if (capd) return;
					let t2 = p.content.capitalize();
					if (p.content !== t2) {
						p.content = t2;
						capd = true;
					}
				});
			}
		}
		return content;
	}

	parse(input: string): Parsed[] {
		logger.trace("parse", input);
		const result: Parsed[] = [];
		const stack: {tag:string,list:Parsed[]}[] = [{tag:'',list:result}];
		// noinspection JSMismatchedCollectionQueryUpdate
		let current: Parsed[] = result;
		let currentTag = '';
		new Lexer(input).eatLoop(lexer => {
			let match: RegExpExecArray;
			if ((match = lexer.tryEat(LA_TEXT))) {
				logger.trace("text '{}'", match[0]);
				current.push({type: "text", content: match[0]});
			} else if ((match = lexer.tryEat(LA_ENTITY))) {
				logger.trace("entity '{}'", match[0]);
				current.push({type: "text", content: parseXmlEntity(match[0])})
			} else if (lexer.tryEat(LA_BR)) {
				logger.trace("br");
				current.push({type:"br"});
			} else if ((match = lexer.tryEat(LA_ESCAPED))) {
				logger.trace("escaped '{}'", match[0][1]);
				current.push({type: "text", content: match[0][1]});
			} else if ((match = lexer.tryEat(LA_SIMPLETAG))) {
				let [_, tag, args] = match;
				logger.trace("simpletag '{}' '{}'", tag, args);
				try {
					current.push(this.evaluateTag(tag, args));
				} catch (e) {
					logger.warn(e);
					current.push({type: "error", content: e});
				}
			} else if ((match = lexer.tryEat(LA_FALSETAG))) {
				logger.trace("falsetag '{}'", match[0]);
				current.push({type: "text", content: match[0]});
			} else if ((match = lexer.tryEat(LA_TAGSTART))) {
				logger.trace("tag '{}'", match[0]);
				// TODO implement complex tag parsing
				throw new Error("Complex tag parsing not implemented");
			} else if ((match = lexer.tryEat(LA_HTMLTAGSTART))) {
				let [_, tag, attrs, ending] = match;
				tag = tag.toLowerCase();
				logger.trace("htmlstart '{}' '{}' '{}'", tag, attrs, ending);
				this.evaluateHtmlTag(tag, attrs, !!ending, current, (tag, list)=>{
					current = list;
					currentTag = tag;
					stack.push({tag,list});
				});
			} else if ((match = lexer.tryEat(LA_HTMLTAGEND))) {
				let tag = match[1].toLowerCase();
				logger.trace("htmlend '{}'", tag);
				if (tag === currentTag) {
					stack.pop();
					current = stack[stack.length - 1].list;
					currentTag = stack[stack.length - 1].tag;
				} else {
					let error = `Bad closing tag '${tag}', expected '${currentTag}'`
					logger.warn(error);
					current.push({type: "error", content: error});
				}
			} else {
				logger.warn('Cannot parse: {}', lexer.remainder);
				current.push({type:"error", content:lexer.remainder});
				lexer.halt();
			}
		});
		return result;
	}
}

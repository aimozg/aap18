/*
 * Created by aimozg on 04.07.2022.
 */
import {LogManager} from "../../logging/LogManager";

const logger = LogManager.loggerFor("engine.text.parser.Lexer");

export class Lexer {
	constructor(private input:string) {
	}
	// TODO Optimization note: Don't cut string into parts, track index and use regexes' matchAt()
	private s = this.input
	public match:RegExpExecArray = null
	get remainder():string {
		return this.s
	}
	get length():number {
		return this.s.length
	}
	eol():boolean {
		return this.s.length===0
	}
	skip(n:number) {
		this.s = this.s.slice(n)
	}
	eat(n:number):string {
		let part = this.s.slice(0, n)
		logger.trace("Matched {}", part)
		this.skip(n);
		return part
	}
	tryEat(lookahead:RegExp):RegExpExecArray {
		lookahead.lastIndex = 0;
		let match = lookahead.exec(this.s);
		if (match) {
			this.match = match;
			logger.trace("Matched {}", match[0])
			this.skip(match[0].length)
		}
		return match;
	}
	eatLoop(iter:(lexer:Lexer)=>void) {
		let n = this.length+1;
		while (!this.eol()) {
			if (this.length >= n) {
				// Ensure string shortens as we go
				throw new Error(`Parser stuck at '${this.remainder}'`)
			}
			n = this.length;
			iter(this);
		}
	}
	halt() {
		this.s = '';
	}
}

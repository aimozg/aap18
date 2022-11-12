/*
 * Created by aimozg on 05.07.2022.
 */
import {Parsed} from "../parser/Parsed";
import {Fragment, h, VNode} from "preact";
import {LogManager} from "../../logging/LogManager";
import {Parser} from "../parser/Parser";
import {Creature} from "../../objects/Creature";
import {TextPages} from "../../ui/panels/TextPages";

const logger = LogManager.loggerFor("engine.text.output.TextOutput")

/**
 * Parses texts and renders in into ScenePanel
 */
export class TextOutput {

	constructor(public readonly pages: TextPages,
	            public readonly parser: Parser = new Parser()) {
	}

	clear(): void {
		this.pages.clear();
	}

	flush(): void {
		this.pages.flush();
	}

	flip(suffix?: string): void {
		this.pages.flipPage(suffix)
	}

	selectActor(actor: Creature) {
		this.parser.setTarget(actor);
	}

	deselectActor() {
		this.parser.deselectActor();
	}

	print(text: string, parseTags: boolean = true): void {
		this.append(this.parser.parse(text, parseTags));
	}

	append(input: Parsed | Parsed[]): void {
		let e = TextOutput.render(input);
		this.pages.addContent(e);
	}

	appendNode(e: Node | string | VNode): void {
		this.pages.addContent(e);
	}

	static render(input: Parsed | Parsed[]): VNode {
		if (Array.isArray(input)) return <Fragment>{input.map(i => TextOutput.render(i))}</Fragment>
		switch (input.type) {
			case "text":
				logger.trace("print text {}", input.content)
				return <Fragment>{input.content}</Fragment>
			/*if (input.content.includes('\n')) {
				let parts = input.content.split('\n');
				return <Fragment>{parts.map((s,i)=>[i > 0 && <br/>,s])}</Fragment>
			} else {
				return <Fragment>{input.content}</Fragment>
			}*/
			case "styledText":
				logger.trace("print styled {}", input.className)
				return <span class={input.className}>{TextOutput.render(input.content)}</span>
			case "error":
				logger.trace("print error {}", input.content)
				return <span class="text-error">{String(input.content)}</span>
			case "hr":
				logger.trace("print hr")
				return <hr/>
			case "br":
				logger.trace("print br")
				return <br/>
			case "group":
				return <Fragment>{input.content.map(i => TextOutput.render(i))}</Fragment>
		}
	}
}


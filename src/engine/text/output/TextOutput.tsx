/*
 * Created by aimozg on 05.07.2022.
 */
import {Parsed} from "../parser/Parsed";
import {Fragment, h, VNode} from "preact";
import {LogManager} from "../../logging/LogManager";
import {ScenePanel} from "../../ui/panels/ScenePanel";

const logger = LogManager.loggerFor("engine.text.output.TextOutput")

export class TextOutput {

	constructor(public readonly panel:ScenePanel) {
	}

	clear():void {
		this.panel.clear()
	}
	flush():void {
		this.panel.flush()
	}
	flip(action?:string):void {
		this.panel.flipPage(action ? '['+action+']' : null)
	}

	print(input:Parsed|Parsed[]):void {
		let e = TextOutput.print(input);
		this.panel.addContent(e);
	}

	append(e:Node|string|VNode):void {
		this.panel.addContent(e);
	}

	appendAction(e:VNode) {
		this.panel.addActions(e);
	}

	static print(input:Parsed|Parsed[]):VNode {
		if (Array.isArray(input)) return <Fragment>{input.map(i => TextOutput.print(i))}</Fragment>
		switch (input.type) {
			case "text":
				logger.trace("print text {}",input.content)
				return <Fragment>{input.content}</Fragment>
				/*if (input.content.includes('\n')) {
					let parts = input.content.split('\n');
					return <Fragment>{parts.map((s,i)=>[i > 0 && <br/>,s])}</Fragment>
				} else {
					return <Fragment>{input.content}</Fragment>
				}*/
			case "styledText":
				logger.trace("print styled {}",input.className)
				return <span class={input.className}>{TextOutput.print(input.content)}</span>
			case "error":
				logger.trace("print error {}",input.content)
				return <span class="text-error">{String(input.content)}</span>
			case "hr":
				logger.trace("print hr")
				return <hr/>
			case "br":
				logger.trace("print br")
				return <br/>
			case "group":
				return <Fragment>{input.content.map(i => TextOutput.print(i))}</Fragment>
		}
	}
}

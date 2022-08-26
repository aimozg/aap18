import {DomComponent} from "../DomComponent";
import {ComponentChildren, h} from "preact";
import {Parsed} from "../../text/parser/Parsed";
import {TextOutput} from "../../text/output/TextOutput";
import {renderAppend} from "../../utils/dom";

export class LogPanel extends DomComponent {
	constructor() {super(<div className="log-panel"></div>);}

	print(p:Parsed|Parsed[]) {
		renderAppend(TextOutput.print(p), this.node)
	}
	append(t:ComponentChildren) {
		renderAppend(t, this.node)
	}
	appendToLast(t:ComponentChildren) {
		renderAppend(t, this.last())
	}
	last(): Element {
		return this.node.lastElementChild
	}
}

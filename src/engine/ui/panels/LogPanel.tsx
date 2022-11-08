import {DomComponent} from "../DomComponent";
import {ComponentChildren, h} from "preact";
import {Parsed} from "../../text/parser/Parsed";
import {TextOutput} from "../../text/output/TextOutput";
import {renderAppend} from "../../utils/dom";

export class LogPanel extends DomComponent {
	constructor() {
		super(<div className="log-panel"></div>);
	}

	print(p: Parsed | Parsed[]) {
		renderAppend(TextOutput.render(p), this.node)
	}

	append(t: ComponentChildren) {
		renderAppend(t, this.node)
	}

	appendToLast(t: ComponentChildren) {
		let last1 = this.last();
		if (last1) renderAppend(t, last1); else this.append(t)
	}

	last(): Element | null {
		return this.node.lastElementChild
	}
}

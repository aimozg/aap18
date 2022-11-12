import {ScenePanel} from "../../ui/panels/ScenePanel";
import {Parser} from "../parser/Parser";
import {VNode} from "preact";
import {TextOutput} from "./TextOutput";

export class InteractiveTextOutput extends TextOutput {
	constructor(
		public readonly panel: ScenePanel,
		parser: Parser = new Parser()
	) {
		super(panel.pages, parser);
	}

	appendAction(e: VNode) {
		this.panel.addActions(e);
	}

	clear() {
		this.panel.clear();
	}

	flush() {
		this.panel.flush();
	}

	flip(suffix?: string) {
		this.panel.flipPage(suffix);
	}
}
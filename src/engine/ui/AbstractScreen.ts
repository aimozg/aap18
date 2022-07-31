import {VNode} from "preact";
import {Game} from "../Game";
import {removeChildren, renderAppend} from "../utils/dom";

export abstract class AbstractScreen {

	container:HTMLElement;

	protected constructor() {
		this.container = document.createElement("div");
		this.container.className = "screen";
	}
	protected get game():Game {
		return Game.instance;
	}

	abstract node():VNode

	render():void {
		removeChildren(this.container);
		renderAppend(this.node(), this.container);
	}

	onAdd(): void {
	}

	onActivate(): void {
		this.container.classList.remove("screen-shaded");
	}

	onDeactivate(): void {
		this.container.classList.add("screen-shaded");
	}

	onRemove(): void {
	}
}

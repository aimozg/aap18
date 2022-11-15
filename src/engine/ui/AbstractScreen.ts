import {render, VNode} from "preact";
import {Game} from "../Game";

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
		render(this.node(), this.container);
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

	onKeyboardEvent(event:KeyboardEvent):void {}

	animationFrame(dt:number, time:number):void{}
}

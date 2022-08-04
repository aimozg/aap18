import {AbstractScreen} from "../AbstractScreen";
import {ComponentChild, createRef, Fragment, h, render, VNode} from "preact";

export interface GameScreenLayout {
	top?: ComponentChild;
	left?: ComponentChild;
	center?: ComponentChild;
	right?: ComponentChild;
	bottom?: ComponentChild;
}

export class GameScreen extends AbstractScreen {

	private layout: GameScreenLayout = {};

	constructor() {
		super();
		this.render();
	}

	readonly root = createRef<HTMLDivElement>()
	readonly top = createRef<HTMLDivElement>();
	readonly center = createRef<HTMLDivElement>();
	readonly left = createRef<HTMLDivElement>();
	readonly right = createRef<HTMLDivElement>();
	readonly bottom = createRef<HTMLDivElement>();

	applyLayout(layout:GameScreenLayout) {
		this.layout = layout;
		render([], this.container);
		this.render();
	}

	node(): VNode {
		return <Fragment>
			<div class="game-layout" ref={this.root}>
				<div class="gl-top" ref={this.top}>{this.layout.top}</div>
				<div class="gl-midrow">
					<div class="gl-left" ref={this.left}>{this.layout.left}</div>
					<div class="gl-center" ref={this.center}>{this.layout.center}</div>
					<div class="gl-right" ref={this.right}>{this.layout.right}</div>
				</div>
				<div class="gl-bottom" ref={this.bottom}>{this.layout.bottom}</div>
			</div>
		</Fragment>
	}

}

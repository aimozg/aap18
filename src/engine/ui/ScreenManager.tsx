/*
 * Created by aimozg on 03.07.2022.
 */


import {AbstractScreen} from "./AbstractScreen";
import {EmptyScreen} from "./screens/EmptyScreen";
import {GameScreen} from "./screens/GameScreen";
import {LogManager} from "../logging/LogManager";
import {animateTransition, TransitionAnimationName} from "./animations";
import {KeyCodes} from "./KeyCodes";
import {CreaturePanel} from "../../game/ui/CreaturePanel";
import {milliTime} from "../utils/time";
import {Game} from "../Game";
import {ComponentChildren, createRef, h} from "preact";
import {renderAppend} from "../utils/dom";
import {Tooltip} from "./components/Tooltip";

const logger = LogManager.loggerFor("engine.ui.ScreenManager");

export class ScreenManager {
	screens: AbstractScreen[] = [];
	gameScreen: GameScreen = new GameScreen();

	sharedPlayerPanel: CreaturePanel = new CreaturePanel(null);
	private tooltip: Tooltip|null = null;

	constructor(
		private screenHolder: HTMLElement
	) {
		this.addTop(new EmptyScreen());
	}

	showTooltip(x:number, y:number, content:ComponentChildren) {
		this.hideTooltip();
		let ref = createRef<Tooltip>()
		renderAppend(<Tooltip ref={ref}
		                      x={x}
		                      y={y}
		                      maxWidth={this.screenHolder.clientWidth}
		                      maxHeight={this.screenHolder.clientHeight}>{content}</Tooltip>, this.screenHolder)
		ref.current!.resize();
		this.tooltip = ref.current!;
	}
	showTooltipAt(origin:MouseEvent|HTMLElement, content:ComponentChildren) {
		let rect = this.screenHolder.getBoundingClientRect();
		let x,y;
		if (origin instanceof HTMLElement) {
			let rect = origin.getBoundingClientRect();
			// TODO show relative to the the rect
			x = rect.x + rect.width/2;
			y = rect.y + rect.height;
		} else {
			x = origin.clientX + 8;
			y = origin.clientY + 8;
		}
		this.showTooltip(x - rect.x, y - rect.y, content);
	}
	hideTooltip() {
		this.tooltip?.remove();
		this.tooltip = null;
	}

	get top(): AbstractScreen {
		return this.screens[this.screens.length - 1];
	}

	private removeTop(activateScreenBelow: boolean): void {
		let top = this.top;
		logger.debug("removeTop");
		if (this.top) {
			top.container.remove();
			top.onDeactivate();
			top.onRemove();
		} else {
			throw new Error("Cannot removeTop, screen is empty");
		}
		this.screens.splice(-1, 1);
		if (activateScreenBelow) this.top?.onActivate();
	}

	private addTop(screen: AbstractScreen): void {
		logger.debug("addTop {}", screen);
		this.screens.push(screen);
		this.screenHolder.append(screen.container);
		screen.render();
		screen.onAdd();
		screen.onActivate();
	}

	async closeTop(transition?: TransitionAnimationName): Promise<void> {
		await animateTransition(this.top.container, transition, "remove");
		this.removeTop(true);
	}

	async addOnTop(screen: AbstractScreen, transition?: TransitionAnimationName): Promise<void> {
		this.top?.onDeactivate();
		this.addTop(screen);
		await animateTransition(screen.container, transition, "add");
	}

	async replaceTop(screen: AbstractScreen, transition?: TransitionAnimationName): Promise<void> {
		await animateTransition(this.top.container, transition, "remove");
		this.removeTop(false);
		this.addTop(screen);
		await animateTransition(screen.container, transition, "add");
	}

	handleKeyboardEvent(event:KeyboardEvent) {
		logger.trace("handleKeyboardEvent {} {}",this.top,KeyCodes.eventToHkString(event))
		this.top.onKeyboardEvent(event)
	}

	t1:number;
	t2:number;
	dt:number;
	private animationFrame() {
		// TODO consider instead of propagating top-down maintaining a list of things that want animations. first - logic, then - FX. and a way to auto-unsubscribe if they are outside DOM
		this.t2 = milliTime();
		this.dt = this.t2 - this.t1;
		Game.instance.gameController.animationFrame(this.dt, this.t2);
		this.top.animationFrame(this.dt, this.t2);
		this.t1 = this.t2;
		requestAnimationFrame(()=>this.animationFrame());
	}

	setupKeyboardInput() {
		document.addEventListener("keydown", event=>{
			this.handleKeyboardEvent(event);
		}, true)
	}

	setupAnimations() {
		this.t1 = milliTime();
		requestAnimationFrame(()=>this.animationFrame());
	}
}


/*
 * Created by aimozg on 03.07.2022.
 */


import {AbstractScreen} from "./AbstractScreen";
import {EmptyScreen} from "./screens/EmptyScreen";
import {GameScreen} from "./screens/GameScreen";
import {LogManager} from "../logging/LogManager";
import {animateTransition, TransitionAnimationName} from "./animations";

const logger = LogManager.loggerFor("engine.ui.ScreenManager");

export class ScreenManager {
	screens: AbstractScreen[] = [];
	gameScreen: GameScreen = new GameScreen();

	constructor(
		private screenHolder: HTMLElement
	) {
		this.addTop(new EmptyScreen());
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
		await animateTransition(screen.container, transition, "add");
		this.addTop(screen);
	}

	async replaceTop(screen: AbstractScreen, transition?: TransitionAnimationName): Promise<void> {
		await animateTransition(this.top.container, transition, "remove");
		this.removeTop(false);
		this.addTop(screen);
		await animateTransition(screen.container, transition, "add");
	}
}


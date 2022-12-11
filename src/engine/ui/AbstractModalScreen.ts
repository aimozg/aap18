/*
 * Created by aimozg on 10.12.2022.
 */

import {AbstractScreen} from "./AbstractScreen";
import {Deferred} from "../utils/Deferred";
import {Game} from "../Game";
import {TransitionAnimationName} from "./animations";

export abstract class AbstractModalScreen<T> extends AbstractScreen {
	readonly promise = new Deferred<T>();

	async showModal(transition: TransitionAnimationName = 'fade-fast'): Promise<T> {
		await this.game.screenManager.addOnTop(this, transition);
		return this.promise;
	}

	async close(value:T, transition: TransitionAnimationName = "fade-fast") {
		await Game.instance.screenManager.closeTop(transition);
		this.promise.resolve(value);
	}

	onActivate() {
		if (this.promise.completed) throw new Error(`Cannot re-add ${this}`);
		super.onActivate();
	}

}

import {VNode} from "preact";
import {Game} from "../../engine/Game";
import {ChargenController} from "./ChargenController";

export abstract class ChargenStep {
	protected constructor(protected cc: ChargenController) {
	}

	protected get player() { return this.cc.player }

	abstract label: string;

	abstract complete(): boolean;

	abstract node(): VNode;

	unlocked: boolean = false;

	protected get game(): Game {
		return Game.instance;
	}
}

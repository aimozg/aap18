import {CGPCData} from "./chargenData";
import {VNode} from "preact";
import {Game} from "../../engine/Game";

export abstract class ChargenStep {
	protected constructor(
		protected pcdata: CGPCData,
		protected onUpdate: () => void) {
	}

	protected player = this.pcdata.player;

	abstract label: string;

	abstract complete(): boolean;

	abstract node(): VNode;

	unlocked: boolean = false;

	protected get game(): Game {
		return Game.instance;
	}
}

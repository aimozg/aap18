/*
 * Created by aimozg on 18.07.2022.
 */

import {IResource} from "../IResource";
import Symbols from "../symbols";
import {GameController} from "../GameController";
import {Game} from "../Game";
import {h, VNode} from "preact";

export interface PlaceDef {
	id: string;
	name: string | ((gc: GameController) => string);
	description: string | ((gc: GameController) => string);
	scene: string | ((gc: GameController) => string);
	sidebar?: string | ((gc: GameController) => string | VNode);
	onEnter?: (gc: GameController) => void;
	onLeave?: (gc: GameController) => void;
	onTime?: (gc: GameController) => void;
}

export interface PlaceProps {
	onEnter(): void;
	onLeave(): void;
	onTime(): void;
	displayName(): string;
	description(): string;
	sidebarDescription(): string | VNode;
	scene(): string;
}

export class Place implements IResource {
	resType = Symbols.ResTypePlace;

	constructor(public readonly resId: string,
	            public readonly props: PlaceProps
	) {}

	displayName(): string { return this.props.displayName() }
	description(): string { return this.props.description() }
	onEnter(): void { this.props.onEnter() }
	onLeave(): void { this.props.onLeave() }
	onTime(): void { this.props.onTime() }
	display(): Promise<any> {
		return Game.instance.gameController.playScene(this.props.scene());
	}

	static Limbo = new Place("/Limbo", {
		displayName: () => "Limbo",
		description: () => "Nothingness. If you're here, game is bugged",
		sidebarDescription: () => "Limbo",
		onEnter() {},
		onLeave() {},
		onTime() {},
		scene: () => ""
	})

	static build(def: PlaceDef): Place {
		function wrapValue<T>(value: T | ((gc: GameController) => T)): () => T {
			if (typeof value === 'function') return () => (value as (gc: GameController) => T)(Game.instance.gameController)
			return () => value;
		}

		function wrapFn(value?: (gc: GameController) => void): () => void {
			if (value) return () => value(Game.instance.gameController);
			return () => {};
		}

		let props: PlaceProps = {
			displayName: wrapValue(def.name),
			description: wrapValue(def.description),
			sidebarDescription: def.sidebar ? wrapValue(def.sidebar) : wrapValue(h("h1", null, def.name)),
			scene: wrapValue(def.scene),
			onEnter: wrapFn(def.onEnter),
			onLeave: wrapFn(def.onLeave),
			onTime: wrapFn(def.onTime)
		}

		return new Place(def.id, props);
	}
}

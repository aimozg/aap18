/*
 * Created by aimozg on 18.07.2022.
 */

import {IResource} from "../IResource";
import Symbols from "../symbols";
import {GameController} from "../GameController";
import {Game} from "../Game";
import {h, VNode} from "preact";
import {Scene} from "../scene/Scene";

export interface PlaceDef {
	id: string;
	name: string | ((gc: GameController) => string);
	description: string | ((gc: GameController) => string);
	scene: string | ((gc: GameController) => string);
	sidebar?: string | ((gc: GameController) => string | VNode);
	onEnter?: (gc: GameController) => void;
	onLeave?: (gc: GameController) => void;
	onTime?: (gc: GameController) => void;
	canRest?: boolean | ((gc:GameController) => boolean);
	canManageInventory?: boolean | ((gc:GameController) => boolean);
	canLevelUp?: boolean | ((gc:GameController) => boolean);
}

export interface PlaceProps {
	onEnter(): void;
	onLeave(): void;
	onTime(): void;
	displayName(): string;
	description(): string;
	sidebarDescription(): string | VNode;
	scene(): string;
	canRest(): boolean;
	canManageInventory(): boolean;
	canLevelUp(): boolean;
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
	canRest():boolean { return this.props.canRest() }
	canManageInventory():boolean { return this.props.canManageInventory() }
	canLevelUp():boolean { return this.props.canLevelUp() }
	get sceneId(): string { return this.props.scene(); }
	get scene(): Scene { return Game.instance.data.scene(this.props.scene()); }

	static Limbo = new Place("/Limbo", {
		displayName: () => "Limbo",
		description: () => "Nothingness. If you're here, game is bugged",
		sidebarDescription: () => "Limbo",
		onEnter() {},
		onLeave() {},
		onTime() {},
		scene: () => "",
		canRest: () => true,
		canManageInventory: () => true,
		canLevelUp: () => true
	})

	static build(def: PlaceDef): Place {
		function wrapValue<T>(value: T | ((gc: GameController) => T)): () => T {
			if (typeof value === 'function') return () => (value as (gc: GameController) => T)(Game.instance.gameController)
			return () => value;
		}
		function wrapValueDef<T>(value: T | undefined | ((gc: GameController) => T), defaultValue:T): () => T {
			if (typeof value === 'function') return () => (value as (gc: GameController) => T)(Game.instance.gameController)
			if (value === undefined) return () => defaultValue;
			return () => value;
		}

		function wrapFn(value?: (gc: GameController) => void): () => void {
			if (value) return () => value(Game.instance.gameController);
			return () => {};
		}

		let props: PlaceProps = {
			displayName: wrapValue(def.name),
			description: wrapValue(def.description),
			sidebarDescription: wrapValueDef(def.sidebar, h("h1", null, def.name)),
			scene: wrapValue(def.scene),
			onEnter: wrapFn(def.onEnter),
			onLeave: wrapFn(def.onLeave),
			onTime: wrapFn(def.onTime),
			canRest: wrapValueDef(def.canRest, true),
			canManageInventory: wrapValueDef(def.canManageInventory, true),
			canLevelUp: wrapValueDef(def.canLevelUp, true)
		}

		return new Place(def.id, props);
	}
}

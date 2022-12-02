/*
 * Created by aimozg on 18.07.2022.
 */

import {IResource} from "../IResource";
import Symbols from "../symbols";
import {GameController} from "../GameController";
import {Game} from "../Game";
import {h, VNode} from "preact";
import {Scene} from "../scene/Scene";
import {Encounter, EncounterDef, EncounterPool, EncounterPoolDef} from "../scene/Encounter";
import {Random} from "../math/Random";

export interface PlaceDef {
	id: string;
	name: string | ((gc: GameController) => string);
	description: string | ((gc: GameController) => string);
	scene: string | Scene | ((gc: GameController) => string);
	encounters?: EncounterPoolDef|EncounterDef[]|string;
	sidebar?: string | ((gc: GameController) => string | VNode);
	onEnter?: (gc: GameController) => void;
	onLeave?: (gc: GameController) => void;
	onTime?: (gc: GameController) => void;
	canRest?: boolean | ((gc:GameController) => boolean);
	canManageInventory?: boolean | ((gc:GameController) => boolean);
	canLevelUp?: boolean | ((gc:GameController) => boolean);
}

export interface PlaceProps {
	encounters: EncounterPool|null;
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
	canExplore():boolean { return !!this.props.encounters; }
	get sceneId(): string { return this.props.scene(); }
	get scene(): Scene { return Game.instance.data.scene(this.props.scene()); }

	pickEncounter(rng:Random=Game.instance.rng):Encounter|null {
		return this.props.encounters!.pickOrNull(rng);
	}

	static Limbo = new Place("/Limbo", {
		encounters: null,
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

		let encounters: EncounterPool|null;
		if (typeof def.encounters === "string") {
			// TODO load EncounterPool from DB
			encounters = null;
		} else if (!def.encounters) {
			encounters = null;
		} else if (Array.isArray(def.encounters)) {
			encounters = new EncounterPool("/$place"+def.id, def.encounters.map(e=>Encounter.build(def.id, e)));
		} else {
			encounters = new EncounterPool(def.id, def.encounters.encounters.map(e=>Encounter.build(def.id, e)));
		}

		let props: PlaceProps = {
			encounters: encounters,
			displayName: wrapValue(def.name),
			description: wrapValue(def.description),
			sidebarDescription: wrapValueDef(def.sidebar, h("h1", null, def.name)),
			scene: wrapValue((def.scene instanceof Scene) ? def.scene.resId : def.scene),
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

export function buildPlace(def: PlaceDef): Place {
	return Place.build(def);
}

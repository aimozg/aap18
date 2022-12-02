/*
 * Created by aimozg on 21.09.2022.
 */

import {buildScene, SceneDef} from "./builder";
import {Scene} from "./Scene";
import {Game} from "../Game";
import {GameController} from "../GameController";
import {Random} from "../math/Random";
import {LogManager} from "../logging/LogManager";

const logger = LogManager.loggerFor("engine.scene.Encounter");

export class Encounter {
	constructor(
		public readonly id: string,
		public readonly sceneRef: string|Scene,
		public chance: number = 1,
		public when?: (gc: GameController) => boolean
	) {
	}

	get scene():Scene {
		return Game.instance.data.scene(this.sceneRef);
	}

	toString(): string {
		return `[Encounter ${this.id}]`
	}

	static build(prefix:string, def: EncounterDef): Encounter {
		let scene: Scene|string;
		if (typeof def.scene === 'string') {
			scene = def.scene;
		} else {
			scene = buildScene(`${prefix}$encounters`, def.name, def.scene);
		}
		return new Encounter(
			def.name,
			scene,
			def.chance ?? 1,
			def.when
		)
	}

	possible(): boolean {
		return this.when?.(Game.instance.gameController) ?? true;
	}
}

export class EncounterPool {
	constructor(
		public readonly id: string,
		public encounters: Encounter[]
	) {
	}

	public pickOrNull(rng: Random): Encounter | null {
		let result = rng.pickWeightedOrNull(this.encounters.filter(e => e.possible()), e => e.chance);
		logger.info("picked {} from {}", result, this)
		return result
	}

	toString(): string {
		return `[EncounterPool ${this.id}]`
	}
}

export interface EncounterDef {
	name: string;
	chance?: number;
	when?: (gc: GameController) => boolean;
	scene: SceneDef | string;
}

export interface EncounterPoolDef {
	id: string;
	encounters: EncounterDef[]
}

/*
 * Created by aimozg on 21.09.2022.
 */

import {SceneDef} from "./builder";
import {Scene} from "./Scene";

export interface Encounter {
	id: string;
	chance: number;
	when?: ()=>boolean;
	scene: Scene;
}

export interface EncounterPool {
	id: string;
	encounters: Encounter[];
}

export interface EncounterDef {
	name: string;
	chance?: number;
	when?: ()=>boolean;
	scene: SceneDef|string;
}

export interface EncounterPoolDef {
	id: string;
	encounters: EncounterDef[]
}

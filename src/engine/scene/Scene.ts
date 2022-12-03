/*
 * Created by aimozg on 17.07.2022.
 */
import {IResource} from "../IResource";
import Symbols from "../symbols";
import {SceneContext} from "./SceneContext";

export type SceneFn = (ctx:SceneContext)=>Promise<void>|void;

export class Scene implements IResource {
	resType = Symbols.ResTypeScene;

	constructor(
		public readonly resId: string,
		public readonly sceneFn: SceneFn
	) {}

	async execute(context:SceneContext) {
		await this.sceneFn(context);
	}

	toString():string {
		return `[Scene ${this.resId}]`
	}
}


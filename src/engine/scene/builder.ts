/*
 * Created by aimozg on 17.07.2022.
 */

import {Scene, SceneFn} from "./Scene";

export type SceneDef = SceneDefCall | SceneDefConst;
export type SceneContent = string|SceneFn;
export type SceneDefCall = SceneFn;
export interface SceneDefConst {
	content: SceneContent;
	next: string;
}
function contentToSceneFn(content:SceneContent, addend:SceneFn): SceneFn {
	if (typeof content === 'string') {
		return ctx =>{
			ctx.say(content);
			addend(ctx);
		}
	} else {
		return ctx =>{
			content(ctx);
			addend(ctx);
		}
	}
}
function doNextFn(next:string):SceneFn {
	return ctx=> ctx.next(next)
}

export function buildScene(namespace: string, id: string, def: SceneDef): Scene {
	let sceneFn: SceneFn;
	if (typeof def === 'function') {
		sceneFn = def;
	} else if ('content' in def) {
		sceneFn = contentToSceneFn(def.content, doNextFn(def.next))
	} else {
		throw new Error("SceneDef " + id + " is incomplete");
	}
	return new Scene(namespace + "_" + id, sceneFn);
}

export function buildScenes<NAMES extends string>(
	namespace:string, sceneDefs:Record<NAMES,SceneDef>
): Record<NAMES,Scene> {

	let scenes = {} as Record<NAMES,Scene>;
	for (let id in sceneDefs) {
		let def = sceneDefs[id];
		scenes[id] = buildScene(namespace, id, def)
	}
	return scenes;
}

/*
 * Created by aimozg on 19.07.2022.
 */

import {Place} from "../objects/Place";
import {Deferred} from "../utils/Deferred";

export interface GameContext {
	ended:boolean;
	promise:Promise<any>;
	onKeyboardEvent?: (event:KeyboardEvent)=>void;
}

export class NullGameContext implements GameContext {
	get ended():boolean { return false }
	promise = new Deferred();
	toString() { return "NulLGameContext"}
}

export class PlaceContext implements GameContext {
	promise = new Deferred();
	get ended():boolean { return this.promise.completed }
	constructor(public place:Place) {}
}

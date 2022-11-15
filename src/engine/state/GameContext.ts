/*
 * Created by aimozg on 19.07.2022.
 */

import {Deferred} from "../utils/Deferred";

export interface GameContext {
	ended:boolean;
	promise:Promise<any>;
	onKeyboardEvent?: (event:KeyboardEvent)=>void;
	animationFrame?:(dt:number, time:number)=>void;
}

export class NullGameContext implements GameContext {
	get ended():boolean { return false }
	promise = new Deferred();
	toString() { return "NulLGameContext"}
}


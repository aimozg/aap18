/*
 * Created by aimozg on 15.08.2022.
 */

import {Item} from "./Item";


export abstract class ItemProperty {
	abstract name:string;
	onAdd(item:Item):void {};
	onRemove(item:Item):void {};
	// TODO implement in superclass with "data" protected property?
	abstract clone():ItemProperty;
}


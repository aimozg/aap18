/*
 * Created by aimozg on 05.07.2022.
 */
import {IResource} from "../../IResource";
import Symbols from "../../symbols";

export abstract class CharacterClass implements IResource{
	readonly resType: symbol = Symbols.ResTypeClass;
	/**
	 * Unique class id, mod-prefixed if needed
	 */
	abstract readonly resId:string;
	/**
	 * Displayed name (lowercase)
	 */
	abstract name:string;
	/**
	 * Displayed description (markup)
	 */
	abstract description:string;
	/**
	 * Can be picked at level 1?
	 */
	abstract isStartingClass:boolean;

}

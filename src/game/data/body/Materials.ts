/*
 * Created by aimozg on 02.08.2022.
 */
import {BodyMaterialType} from "../../../engine/objects/creature/BodyMaterial";

export namespace BodyMaterialTypes {
	export let SKIN = new BodyMaterialType("/skin", "skin", false)
	export let HAIR = new BodyMaterialType("/hair", "hair", false)
	export let FUR = new BodyMaterialType("/fur", "fur", false)
	export let SCALES = new BodyMaterialType("/scales", "scales", true)
	export let CHITIN = new BodyMaterialType("/chitin", "chitin", false)
	export let FEATHERS = new BodyMaterialType("/feathers", "feathers", true)
}

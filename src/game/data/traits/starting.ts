/*
 * Created by aimozg on 27.08.2022.
 */

import {SimpleTraitType} from "../../../engine/rules/TraitType";

export namespace GdStartingTraits {
	export let MalleableBody = new SimpleTraitType("/st_malleablebody", "Malleable Body", "Transformatives are 20% more potent.");
	export let StableBody = new SimpleTraitType("/st_stablebody", "Stable Body", "Transformatives are 20% less potent.");

	export let ALL = [MalleableBody, StableBody];
}

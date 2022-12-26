/*
 * Created by aimozg on 27.08.2022.
 */

import {SimplePerkType} from "../../../engine/rules/PerkType";

export namespace GdStartingPerks {
	export let MalleableBody = new SimplePerkType("/pk_malleablebody", "Malleable Body", "Transformatives are 20% more potent.");
	export let StableBody = new SimplePerkType("/pk_stablebody", "Stable Body", "Transformatives are 20% less potent.");

	export let ALL = [MalleableBody, StableBody];
}

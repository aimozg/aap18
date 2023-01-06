/*
 * Created by aimozg on 27.08.2022.
 */

import {createPerk} from "../../../engine/rules/PerkType";

export namespace GdStartingPerks {
	export let MalleableBody = createPerk({
		id: "/pkstart_malleablebody",
		name: "Malleable Body",
		description: "Transformatives are 20% more potent."
	});
	export let StableBody = createPerk({
		id: "/pkstart_stablebody",
		name: "Stable Body",
		description: "Transformatives are 20% less potent."
	});

	export let ALL = [MalleableBody, StableBody];
}

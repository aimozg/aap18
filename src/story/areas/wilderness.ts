/*
 * Created by aimozg on 21.09.2022.
 */

/**
 * A sketch of how CoCX "Explore" area would look like in this engine
 */

import {EncounterPoolDef} from "../../engine/scene/Encounter";
import {buildScenes} from "../../engine/scene/builder";

let WildernessEncounters: EncounterPoolDef = {
	id: "/wilderness",
	encounters: [{
		name: "trader",
		scene: "/wilderness_trader"
	}, {
		name: "goblin",
		scene: "/generic_goblin"
	}, {
		name: "imp",
		scene: "/generic_imp"
	}]
}

let WildernessScenes = buildScenes("/wilderness", {
	"trader": (ctx) => {
		ctx.say("<i>(Placeholder)</i>\n" +
			"You encounter a wandering trader")
		ctx.choices({
			"Barter": (ctx)=>{
				ctx.barter({
					buys: true,
					sells: [{
						id: ConsumableLib.VitalityTincture
					}, {
						id: ConsumableLib.ScholarsTea
					}]
				})
			},
			"Leave": ctx => ctx.endNow()
		})
	}
})

let GenericScenes = buildScenes("/generic", {
	"goblin": (ctx) => {
		let monster = new Goblin();
		ctx.ambush({
			dc: 15,
			tags: ['monster','outside','wilderness','humanoid'],
			monsters: [monster],
			fail: "You bump into a goblin!",
			critFail: "You're ambushed by a goblin!",
			success: "You spot a goblin. She doesn't notice you and you consider your options",
			successOptions: [{
				label: "Talk",
				hint: "Attempt peaceful negotiations",
				call: (ctx) => {

				}
			}, {
				label: "Seduce",
				hint: "Try to seduce the goblin with your body",
				call: (ctx) => {
					ctx.say("You flash the goblin.")
					let result = ctx.seduceRoll({target: monster})
					if (result.success) {

					} else {

					}
				}
			}, {
				label: "Pounce",
				hint: "Skip the foreplay and jump the goblin",
				call: (ctx) => {

				}
			}, {
				label: "Sneak Attack",
				call: (ctx) => {

				}
			}, {
				label: "Leave",
				hint: "Just leave it alone",
				call: (ctx) => {
					ctx.endNow()
				}
			}]
		});

	},
	"golem": (ctx) => {

	},
	"imp": (ctx) => {
		ctx.say("<i>(Placeholder)</i>\n" +
			"You encounter a random imp!")
	}
})

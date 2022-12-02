/*
 * Created by aimozg on 18.07.2022.
 */
import {Imp} from "../monsters/Imp";
import {ConsumableLib} from "../../game/data/items/ConsumableLib";
import {buildScene} from "../../engine/scene/builder";
import {buildPlace} from "../../engine/place/Place";

const namespace = "/sc001"

export namespace CampScenes {
	export let CampScene = buildScene(namespace, "camp", ctx => {
		ctx.say("A ruined tower you use as your base.");
	});
	export let CampPlace = buildPlace({
		id: "/pl_camp",
		name: "Camp",
		description: "A ruined tower you use as your base.",
		scene: CampScene,
		encounters: [{
			name: "imp",
			scene: async (ctx) => {
				await ctx.ambush({
					monsters: [new Imp()],
					threatName: "a stray imp"
				});
			},
			when: gc => gc.player.isAlive
		}, {
			name: "imps",
			scene: async (ctx) => {
				await ctx.ambush({
					monsters: [new Imp(), new Imp()],
					threatName: "two stray imps"
				});
			},
			when: gc => gc.player.isAlive
		}, {
			name: "debug_item",
			scene: async (ctx)=> {
				let item = ConsumableLib.PotionHealingLesser.spawn();
				ctx.say(`You found ${item.name}!`);

				await ctx.pickupItems([item]);
				ctx.endNow();
			}
		}]
	})
}

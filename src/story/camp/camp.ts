/*
 * Created by aimozg on 18.07.2022.
 */
import {GameDataBuilder} from "../../game/GameDataBuilder";
import {SceneContext} from "../../engine/scene/SceneContext";
import {Imp} from "../monsters/Imp";
import {ConsumableLib} from "../../game/data/items/ConsumableLib";

export function gdRegisterPlayerCamp(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterPlayerCamp")
	gd.buildScenes("/001", {
		camp: (ctx:SceneContext) => {
			ctx.say("A ruined tower you use as your base.");
		}
	});
	gd.buildPlace({
		id: "/camp",
		name: "Camp",
		description: "A ruined tower you use as your base.",
		scene: "/001_camp",
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

/*
 * Created by aimozg on 18.07.2022.
 */
import {GameDataBuilder} from "../../game/GameDataBuilder";
import {SceneContext} from "../../engine/scene/SceneContext";
import {Imp} from "../monsters/Imp";

export function gdRegisterPlayerBase(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterPlayerBase")
	gd.buildScenes("/001", {
		base(ctx:SceneContext) {
			ctx.say("A ruined tower you use as your base.")
			/*
			ctx.choices({
				"Rest": {
					async call (ctx:SceneContext) {
						ctx.say("You rest...")

						ctx.gc.recoverPlayer();

						ctx.endButton()
					}
				},
				"Explore": {
					async call(ctx:SceneContext) {
						await ctx.ambush({
							monsters: [new Imp()],
							threatName: "a stray imp"
						});
					},
					disabled: !ctx.player.isAlive
				}
			})
			*/
		}
	});
	gd.buildPlace({
		id: "/base",
		name: "Camp",
		description: "A ruined tower you use as your base.",
		scene: "/001_base",
		encounters: [{
			name: "imp",
			scene: async (ctx) => {
				await ctx.ambush({
					monsters: [new Imp()],
					threatName: "a stray imp"
				});
			},
			when: gc => gc.player.isAlive
		}]
	})
}

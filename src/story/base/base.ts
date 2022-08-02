/*
 * Created by aimozg on 18.07.2022.
 */
import {GameDataBuilder} from "../../game/gdtypes";
import {SceneContext} from "../../engine/scene/SceneContext";
import {TutorialImp} from "../monsters/TutorialImp";

export function gdRegisterPlayerBase(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterPlayerBase")
	gd.buildScenes("/001", {
		base(ctx:SceneContext) {
			ctx.say("A ruined tower you use as your base.")

			ctx.choices({
				async "Rest"(ctx:SceneContext) {
					ctx.say("You rest...")

					ctx.gc.recoverPlayer();

					ctx.endScene()
				},
				"Explore": {
					async call(ctx:SceneContext) {
						ctx.say("A monster attacks you!")

						ctx.endAndBattle(new TutorialImp())
					},
					disabled: !ctx.player.isAlive
				}
			})
		}
	});
	gd.buildPlace({
		id: "/base",
		name: "Base",
		description: "A ruined tower you use as your base.",
		scene: "/001_base"
	})
}

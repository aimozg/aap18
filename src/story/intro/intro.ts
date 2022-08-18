/*
 * Created by aimozg on 17.07.2022.
 */

import {SceneContext} from "../../engine/scene/SceneContext";
import {GameDataBuilder} from "../../game/gdtypes";
import {MeleeWeaponLib} from "../../game/data/items/MeleeWeaponLib";
import {ArmorLib} from "../../game/data/items/ArmorLib";

const namespace = '/000';

export function gdRegisterIntro(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterIntro")
	gd.buildScenes(namespace, {
		async intro(ctx: SceneContext) {
			// Set player location
			ctx.gc.placePlayer('/base');
			ctx.player.setMainHandItem(MeleeWeaponLib.Dagger.spawn());
			ctx.player.setBodyArmor(ArmorLib.LeatherArmor.spawn());

			let origin = ctx.player.origin;
			if (origin && origin.introText) {
				ctx.say(origin.introText);

				await ctx.flipPage();
			}

			if (ctx.player.originId === "isekai") {
				ctx.say("After the reincarnation vertigo passes, you check your surroundings. ")
			} else {
				ctx.say("After the teleportation vertigo passes, you check your surroundings. ")
			}
			if (ctx.player.originId === 'champion') {
				ctx.say("Your companions are nowhere to be found. ")
			}

			await ctx.flipPage("Look around");

			ctx.say("You gaze upon the unfamiliar landscape. You might've expected hell or some alien land, but all you see is an ordinary steppe. ");
			if (ctx.player.originId === "champion") {
				ctx.say("There is no return portal, as if the one you went through was one-way. ")
			}
			ctx.say("[pg] You notice a ruined stone building nearby. Far away, you see mountiains to the north and dense forest to the west. To your east and south you see nothing but scarce vegetation until the horizon. ")

			await ctx.flipPage("Check the ruins");

			ctx.say("You cautiously approach the building. It appears to be three-story tower, destroyed many years ago. Its first floor is littered by sand, rocks, and branches. You find traces of a campfire &ndash; looks like it was used as a refuge for an occasional traveler. [pg] There is a hole in a ceiling leading to the second floor. [pg] You think you could rest here. [pg] <b>Your first task is to find a source of water and food.</b>");

			ctx.endScene();
		}
	});
}

/*
 * Created by aimozg on 17.07.2022.
 */

import {SceneContext} from "../../engine/scene/SceneContext";
import {MeleeWeaponLib} from "../../game/data/items/MeleeWeaponLib";
import {ArmorLib} from "../../game/data/items/ArmorLib";
import {TutorialImp} from "../monsters/TutorialImp";
import {ConsumableLib} from "../../game/data/items/ConsumableLib";
import {buildScenes} from "../../engine/scene/builder";
import {SceneLib} from "../index";

const namespace = '/sc000';

export let IntroScenes = buildScenes(namespace, {
	async intro(ctx: SceneContext) {
		// Set player location
		ctx.gc.placePlayer(SceneLib.Camp.CampPlace);
		if (!ctx.player.mainHandItem) ctx.player.setMainHandItem(MeleeWeaponLib.Dagger.spawn());
		if (!ctx.player.bodyArmor) ctx.player.setBodyArmor(ArmorLib.LeatherArmor.spawn());
		ctx.player.inventory.addItem(ConsumableLib.PotionHealingLesser.spawn());

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
		ctx.say("[pg] You notice a ruined stone building nearby. Far away, you see mountains to the north and dense forest to the west. To your east and south you see nothing but scarce vegetation until the horizon. ")

		await ctx.flipPage("Check the ruins");

		ctx.say("You cautiously approach the building. It appears to be a three-story tower, destroyed many years ago. There is some noise inside. ");

		ctx.say("<p class='help-block'>When you enter a room with monster(s), an Ambush skill check is rolled. If you succeed, you can choose an action against an unaware enemy. If you fail, you fight. If you fail by 10 or more, you're the one ambushed! </p>")

		let tutorialCombat = true;
		if (tutorialCombat) {
			let monster = new TutorialImp();
			await ctx.ambush({
				dc: 10,
				roll: 19,
				tags: ['monster', 'inside', 'demon', 'scripted'],
				monsters: [monster],
				fail: "Tutorial ambush failed - this should never happen. Please report a bug.",
				critFail: "Tutorial ambush critically failed - this should never happen. Please report a bug.",
				success: "You peek inside and spot a short, ugly demon crouched in the corner. It rummages the pile of stones, searching for something, with his unprotected back open for you to attack.",
				successOptions: [{
					label: "Talk",
					tooltip: "Greet the imp and try to talk",
					disabled: {hint: "Peace was never an option"}
				}, {
					label: "Seduce",
					tooltip: "Try to seduce the imp with your body",
					disabled: {hint: "Why would you do that?"}
				}, {
					label: "Rape",
					tooltip: "Skip the foreplay and fuck the imp",
					disabled: {hint: "Why would you do that?"}
				}, {
					label: "Sneak Attack",
					tooltip: "Start the combat in sneak mode",
					call(ctx) {
						ctx.endNowAndBattle({
							enemies: [monster],
							ambushed: "enemies",
							map: {
								cells: [
									" ###### ",
									"##%...##",
									"#%%1...#",
									"#%%.....",
									"#.....2.",
									"#......#",
									"##....##",
									" ###### ",
								],
								mappings: {
									' ': {tile: '/wall', visible: false},
									'#': {tile: '/wall'},
									'.': {tile: '/floor'},
									'%': {tile: '/rubble'},
									'1': {tile: '/floor', spawn: 'enemy'},
									'2': {tile: '/floor', spawn: 'party'},
								}
							},
							then(ctx) {
								// TODO
								ctx.say(`TODO write post tutorial battle content.
								[pg]
								battle result is: ${JSON.stringify(ctx.lastBattleResult)}
								
								victory=${ctx.lastBattleVictory}
								lustVictory=${ctx.lastBattleLustVictory}
								hpVictory=${ctx.lastBattleHpVictory}
								defeat=${ctx.lastBattleDefeat}
								lustDefeat=${ctx.lastBattleLustDefeat}
								hpDefeat=${ctx.lastBattleHpDefeat}`);
								ctx.endButton()
							}
						})
					}
				}, {
					label: "Leave",
					tooltip: "Just leave it alone",
					disabled: {hint: "Not in this tutorial, sorry"}
				}]
			});
		} else {
			ctx.say("Its first floor is littered by sand, rocks, and branches. You find traces of a campfire &ndash; looks like it was used as a refuge for an occasional traveler. [pg] There is a hole in a ceiling leading to the second floor. [pg] You think you could rest here. [pg] <b>Your first task is to find a source of water and food.</b>");

			ctx.endButton();
		}
	}
});

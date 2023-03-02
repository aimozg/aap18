import {Character} from "../../engine/objects/creature/Character";
import {RacialGroups} from "../../game/data/racialGroups";
import {Game} from "../../engine/Game";
import {TinyFireBolt} from "./abilities/TinyFireBolt";
import {LootTable, setupLoot} from "../../engine/objects/Loot";
import {TSex} from "../../engine/rules/gender";
import {buildScene} from "../../engine/scene/builder";
import {MeleeWeaponLib} from "../../game/data/items/MeleeWeaponLib";

const namespace = '/moimp';

export namespace ImpScenes {
	export let encounter = buildScene(namespace, 'encounter', async (ctx) => {
		let imp = new Imp(ctx.either('m', 'f'));
		await ctx.ambush({
			fail: "As you explore your surroundings, the sound of flapping wings alerts you to the fact you might not be alone. As you turn to face your opponent you are immediately greeted by your assailant. Your foe appears to be an imp, the regular [skincolor] skinned short-sized pest supporting a tiny frame. This imp is [mf:male|female], and [he] intends to have its way with you!",
			monsters: [imp],
			threatName: "a stray imp",
			defeat: imp.sex === 'm' ? maleLossScene : femaleLossScene,
			victory: victoryScene
		});
	})

	export let victoryScene = buildScene(namespace, 'victory', ctx => {
		ctx.say("TODO write the victory scene")
		ctx.endButton()
	})

	export let maleLossScene = buildScene(namespace, 'maleLoss', ctx => {
		ctx.say(`As you fall, defeated the small demon smirks as he grips his cock with a free hand, approaching you with proud, determined steps.

		You don't get a chance to protest as he practically leaps onto your face, cock first before aligning his tool to your lips, forcing it down your mouth as it reaches down your throat.
		
		You try to shove him off but the tiny demon shoves your head down as he pushes your chest down with his knee, <i>"Yeah, you're my bitch now. Don't even think about biting or anything now that I'm in control."</i>
		
		Your squirming seems to get him off further as his pulsating dick reverberates through your body as he continues thrusting into your mouth. He grunts softly as he pulls your head in to take in more of his cock. As his fat balls brush against your chin with each pump, all you can do is submit, eager for him to flood your waiting throat with his unholy seed, filling your stomach with every ounce of his cum. You need him to fill you with his love. You yearn for his body, his massive manhood to indulge you with its warm encouragement.
		
		In a matter of seconds, he unleashes a prideful roar as his twitching member unloads every ounce of cum he has stored for you. As he finishes, he unceremoniously pulls out, resting his cum-leaking cock atop your face, dragging his shaft around, marking you as his before leaving you on the ground, dazed
		
		You lie down, defeated as you recover. Your thoughts swarm, still flooded by the thought of him, you seemingly can't shake it off, your mind a bit more perverse than before.
		`);
		ctx.endButton();
	});

	export let femaleLossScene = buildScene(namespace, 'femaleLoss', ctx=>{
		ctx.say(`As you fall, defeated, the small demon smirks, fingering herself preemptively as she sashays toward you. Her womanly hips sway hypnotically in tune with her proud, determined steps.

		You barely get a chance to protest as she practically leaps onto your face, bringing her labia to your lips. Her scent is overpowering as she squeezes your cheeks, <i>"Go on, give me a good licking, or else I'll show you a whole new world of pain, slut."</i>
		
		Before you know it, your tongue is already digging into her fiendish slit, trying to coax her to orgasm, your own eyes rolling, clenching your body as getting her off is starting to turn you on more and more. She moans in appreciation, caressing the side of your face with her mismatched hand every time you hit her clit, which she responds by wetting your throat with an increasing amount of her unholy girlcum. It's not long until she squeals in her orgasm, drenching your dazed face in corrupted fluids before giving you a parting pinch on your cheek and unceremoniously standing up, leaving you to bask in the mess she made.
		
		It takes you a while to recover. When you do, you find your thoughts slightly dirtier than before, still haunted by that unholy cunt of hers.`);
		ctx.endButton();
	});
}

export class Imp extends Character {
	static ImpLootTable: LootTable = {
		variants: [{
			money: [5, 15],
			items: [{
				chance: 0.25,
				base: MeleeWeaponLib.Dagger1
			}]
		}]
	}

	/**
	 * TODO generic "NPC template" options object? Level, sex, etc
	 */
	constructor(sex: TSex) {
		super();

		this.rgroup = RacialGroups.DEMON;
		this.name = "imp";

		this.stats.level = 1;
		this.stats.naturalAttrs = [
			4, 5, 4, 6,
			5, 3, 3, 3
		];
		this.stats.baseHpPerLevel = 5;
		this.stats.baseEpPerLevel = 5;
		this.stats.baseLpMax = 25;

		this.body.eyes.color = Game.instance.data.colorByName("red", "eyes");
		this.setSex(sex);
		// TODO set imp body parts

		this.abilities.push(TinyFireBolt);

		setupLoot(this, Imp.ImpLootTable);

		this.updateStats();
	}
}

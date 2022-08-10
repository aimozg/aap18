/*
 * Created by aimozg on 04.07.2022.
 */
import {GameDataBuilder} from "../gdtypes";

export function gdRegisterOrigins(gd: GameDataBuilder) {
	gd.logger.debug("gdRegisterOrigins");
	gd.addPlayerOrigins({
		id: 'unknown',
		name: 'Unknown',
		description:
			"Your origins are a mystery." +
			"\n\n" +
			"<i>No starting bonuses.</i>",
	}, {
		id: 'native',
		name: 'Native',
		description:
			"You're an orphan, native to this world who spend their early life in a poor village. Your first attempt to scavenge a magical ruin for riches went badly, and you've triggered some kind of teleportation trap. You don't recognize the new landscape and even the stars and seasons seem to be off." +
			"\n\n" +
			"<i>Extra starting races: Halfkins and Beastkins.<br/>" +
			"Can start as a futanari. <br/>" +
			"Bonus starting skills. <br/>" +
			"Basic starting items.</i>",
		introText: "You're an orphan, native to this world who spend their early life in a poor village. Your first attempt to scavenge a magical ruin for riches went badly, and you've triggered some kind of teleportation trap. "
	}, {
		id: 'champion',
		name: 'Champion',
		description:
			"You're a knight who led the purge of a village of Notingnam, a dark village with foul traditions, buried deep in the wilds. After executing demon-worshipping heretics, you've discovered a portal to some kind of Demon Realm. You and your loyal followers entered it bravely, but you were the only one who passed through. " +
			"\n\n" +
			"<i>Extra starting races: Elf, Half-Elf, Dwarf. <br/>" +
			"Bonus starting XP. <br/>" +
			"Good starting equipment.</i>",
		introText: "You're a knight who led the purge of a village of Notingnam, a dark village with foul traditions, buried deep in the wilds. After executing demon-worshipping heretics, you've discovered a portal to some kind of Demon Realm. You and your loyal followers entered it bravely..."
	}, {
		id: 'isekai',
		name: 'Isekai Hero',
		description:
			"You're an ordinary highschool student who just turned eighteen. Overstressed by upcoming exams and constant pranks from your childhood friend of opposite sex, you rushed to the school but were hit by a truck. By the will of unknown powers, you were reincarnated in an 18+ fantasy world. " +
			"\n\n" +
			"<i>Lucky Newbie: Bonus defense, and XP gain until level 6.</i>",
		introText: "You're an ordinary highschool student who just turned eighteen. Overstressed by upcoming exams and constant pranks from your childhood friend of opposite sex, you were hit by a truck as you rushed to the school. By the will of unknown powers, you were reincarnated in an 18+ fantasy world. "
	}/*, {
		id: 'amnesia',
		name: 'Amnesiac',
		description:
			"You have no idea who you are. " +
			"Strangely, you're able to fluently speak, read, and write the language of this world." +
			"\n\n" +
			"<i>Starting race: Human.</i>"
	}*/);
}

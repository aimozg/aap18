/*
 * Created by aimozg on 04.07.2022.
 */
import {ClassWarrior, WarriorPerks} from "./classes/ClassWarrior";
import {GameDataBuilder} from "../GameDataBuilder";

export function gdRegisterClasses(gd:GameDataBuilder) {
	gd.logger.debug("gdRegisterClasses");
	gd.addClasses(ClassWarrior);
	gd.addPerksFromRecord(WarriorPerks);
}

/*
export function gdClases():GDClass[] {
	return [{
		id: "warrior",
		name: "Warrior",
		startingClass: true,
		description: "" +
			"\n\n" +
			// "Skills: " +
			// "\n" +
			"Subclasses: Duelist, Barbarian, Paladin"
	}, {
		id: "rogue",
		name: "Rogue",
		startingClass: false,
		description: "" +
			"\n\n" +
			"Subclasses: Assassin, Ranger"
	}, {
		id: "mage",
		name: "Mage",
		startingClass: false,
		description: "" +
			"\n\n" +
			"Subclasses: Sorcerer, Necromancer, Druid"
	}, {
		id: "adventurer",
		name: "Adventurer",
		startingClass: false,
		description: "An all-rounder survivalist/treasure hunter class." +
			"\n\n" +
			"Subclasses: Explorer, Shifter"
	}, {
		id: "cultivator",
		name: "Cultivator",
		startingClass: false,
		description: "Cultivate ki to empower your body and soul." +
			"\n\n" +
			"Subclasses: Body Cultivator, Soul Cultivator, Mind Cultivator"
	}, {
		id: "slacker",
		name: "Slacker",
		startingClass: false,
		description: "Why fight when you can have fun? Persuade or seduce others" +
			"\n\n" +
			"Subclasses: Bard, Seducer"
	}, ]
}
*/

import {DamageType} from "./Damage";

export const DamageTypes = {
	SHARP: new DamageType("/sharp", "sharp", "sharp"),
	BLUNT: new DamageType("/blunt", "blunt", "blunt"),
	FIRE: new DamageType("/fire", "fire", "fire"),
	ICE: new DamageType("/ice", "ice", "ice"),
	SHOCK: new DamageType("/shock", "shock", "shock"),
	ACID: new DamageType("/acid", "acid", "acid"),
	MAGIC: new DamageType("/magic", "magic", "magic"),
	DARKNESS: new DamageType("/darkness", "darkness", "darkness"),
	LIGHT: new DamageType("/light", "light", "light"),
	PURE: new DamageType("/pure", "pure", "pure"),
}

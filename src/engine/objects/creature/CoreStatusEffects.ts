import {StatusEffectType} from "./StatusEffect";

export namespace CoreStatusEffects {
	export let Horny25 = StatusEffectType.build({
		id: "/se_horny25",
		name: "Horny (25%)",
		icon: {
			text: "H",
			fg: "#4f4",
			bg: "#808"
		},
		buffs: {
			DEX: -1,
			INT: -1,
			WIS: -1,
			CHA: +1,
			SedRes: -10,
		}
	});
	export let Horny50 = StatusEffectType.build({
		id: "/se_horny50",
		name: "Very Horny (50%)",
		icon: {
			text: "H",
			fg: "#ff4",
			bg: "#808"
		},
		buffs: {
			DEX: -2,
			INT: -2,
			WIS: -2,
			CHA: +2,
			SedRes: -20,
		}
	});
	export let Horny75 = StatusEffectType.build({
		id: "/se_horny75",
		name: "Extremely Horny (75%)",
		icon: {
			text: "H",
			fg: "#f84",
			bg: "#808"
		},
		buffs: {
			DEX: -3,
			INT: -3,
			WIS: -3,
			CHA: +3,
			SedRes: -30,
		}
	});
	export let Horny100 = StatusEffectType.build({
		id: "/se_horny100",
		name: "Desperately Horny (100%)",
		icon: {
			text: "H",
			fg: "#f44",
			bg: "#808"
		},
		buffs: {
			DEX: -4,
			INT: -4,
			WIS: -4,
			CHA: +4,
			SedRes: -40,
		}
	});

}

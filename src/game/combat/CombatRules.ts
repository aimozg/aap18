/*
 * Created by aimozg on 03.08.2022.
 */
import {CombatAction} from "../../engine/combat/CombatAction";
import {CombatController} from "../../engine/combat/CombatController";
import {MeleeAttackAction} from "./actions/MeleeAttackAction";
import {PlayerCharacter} from "../../engine/objects/creature/PlayerCharacter";
import {Creature} from "../../engine/objects/Creature";
import {Damage, DamageSpec, DamageSpecEntry} from "../../engine/rules/Damage";
import {Game} from "../../engine/Game";
import {SkipCombatAction} from "../../engine/combat/SkipCombatAction";
import {Dice, Dices} from "../../engine/math/Dice";
import {CombatRoll, CombatRollProcessor} from "../../engine/combat/CombatRoll";

export namespace CombatRules {

	export function postSetup() {
		MeleeAttackQueue.sortOn("priority")
	}

	export const MELEE_PRIO_CALC_AP = 100;
	export const MELEE_PRIO_CALC_BONUS = 200;
	export const MELEE_PRIO_CALC_DC = 300;
	export const MELEE_PRIO_CALC_DAMAGE = 400;
	export const MELEE_PRIO_STRIKE = 500;
	export const MELEE_PRIO_DEDUCE_AP = 600;
	export const MELEE_PRIO_ROLL = 700;
	export const MELEE_PRIO_HIT_CHECK = 800;
	export const MELEE_PRIO_HIT = 1000;
	export const MELEE_PRIO_ROLL_DAMAGE = 1100;
	export const MELEE_PRIO_DEAL_DAMAGE = 1200;
	export const MELEE_PRIO_POST_HIT = 1500;

	export let MeleeDefaultCalcAp: CombatRollProcessor = {
		priority: MELEE_PRIO_CALC_AP,
		async process(cc:CombatController, roll: CombatRoll) {
			// TODO melee attack AP cost
			if (!roll.free) roll.ap = 1000;
		}
	};
	export let MeleeDefaultCalcBonus: CombatRollProcessor = {
		priority: MELEE_PRIO_CALC_BONUS,
		async process(cc:CombatController, roll: CombatRoll) {
			// TODO weapon type-dependent
			// TODO enchantments
			roll.bonus = roll.actor.strMod;
		}
	};
	export let MeleeDefaultCalcDc: CombatRollProcessor = {
		priority: MELEE_PRIO_CALC_DC,
		async process(cc:CombatController, roll: CombatRoll) {
			roll.bonus = meleeAttackVs(roll.actor, roll.target);
		}
	};
	export let MeleeDefaultCalcDamage: CombatRollProcessor = {
		priority: MELEE_PRIO_CALC_DAMAGE,
		async process(cc:CombatController, roll: CombatRoll) {
			roll.damageSpec = meleeDamageVs(roll.actor, roll.target);
		}
	};
	export let MeleeDefaultDeduceAp: CombatRollProcessor = {
		priority: MELEE_PRIO_DEDUCE_AP,
		async process(cc:CombatController, roll: CombatRoll) {
			if (!roll.free && roll.ap > 0) {
				await cc.deduceAP(roll.actor, roll.ap)
			}
		}
	};
	export let MeleeDefaultRoll: CombatRollProcessor = {
		priority: MELEE_PRIO_ROLL,
		async process(cc:CombatController, roll: CombatRoll) {
			roll.roll = cc.rng.d20();
		}
	}
	export let MeleeDefaultHitCallback: CombatRollProcessor = {
		priority: MELEE_PRIO_HIT,
		async process(cc:CombatController, roll: CombatRoll): Promise<void> {
			return roll.onHit?.(roll, cc)
		}
	}
	export let MeleeDefaultHitCheck: CombatRollProcessor = {
		priority: MELEE_PRIO_HIT_CHECK,
		async process(cc:CombatController, roll: CombatRoll) {
			if (roll.roll === 1 && roll.canCritMiss) {
				roll.hit = false;
				roll.critMiss = true;
			} else if (roll.roll === 20 && roll.canCritMiss) {
				roll.hit = true;
				roll.critHit = true;
			} else {
				roll.hit = roll.roll + roll.bonus >= roll.dc;
			}
		}
	}
	export let MeleeDefaultRollDamage: CombatRollProcessor = {
		priority: MELEE_PRIO_ROLL_DAMAGE,
		async process(cc:CombatController, roll: CombatRoll) {
			if (!roll.hit) return;
			roll.damage = rollDamage(roll.damageSpec, roll.critHit, 2);
		}
	}
	export let MeleeDefaultDealDamage: CombatRollProcessor = {
		priority: MELEE_PRIO_DEAL_DAMAGE,
		async process(cc:CombatController, roll: CombatRoll) {
			if (!roll.hit) return;
			await cc.doDamages(roll.target, roll.damage, roll.actor);
		}
	}

	export let MeleeAttackQueue: CombatRollProcessor[] = [
		MeleeDefaultCalcAp,
		MeleeDefaultCalcBonus,
		MeleeDefaultCalcDc,
		MeleeDefaultCalcDamage,
		MeleeDefaultDeduceAp,
		MeleeDefaultRoll,
		MeleeDefaultHitCheck,
		MeleeDefaultHitCallback,
		MeleeDefaultRollDamage,
		MeleeDefaultDealDamage,
	];

	export function playerActions(player:PlayerCharacter, cc:CombatController):CombatAction<any>[] {
		let actions:CombatAction<any>[] = [];
		actions.push(new SkipCombatAction(player));
		// TODO targets
		actions.push(new MeleeAttackAction(player, cc.enemies[0]))
		// TODO tease
		// TODO abilities
		return actions;
	}

	export function repeatPositive(dice:Dice, n:number):Dice {
		if (n < 2 || dice.bonus >= 0) return dice.repeat(n);
		return new Dice(n*dice.rolls, dice.sides, dice.bonus);
	}

	export function rollDamage(spec:DamageSpec, crit:boolean, critMultiplier:number):Damage[] {
		let rng = Game.instance.rng
		return spec.map(d=>({
			damage: Math.max(1, crit && d.canCrit ? repeatPositive(d.damage,critMultiplier).roll(rng) : d.damage.roll(rng)),
			damageType: d.damageType
		}))
	}

	// TODO move to extension functions
	/**
	 * Attack rating with current mele weapon
	 */
	export function meleeAttack(attacker:Creature):number {
		let value = attacker.strMod
		return value
	}
	export function meleeAttackVs(attacker:Creature, target:Creature):number {
		// TODO target-dependent effects
		return meleeAttack(attacker)
	}

	/**
	 * Melee defense rating
	 */
	export function meleeDefense(creature:Creature):number {
		let value = 5
		value += creature.dexMod
		value += creature.bodyArmor?.asArmor?.defenseBonus ?? 0
		// TODO armor
		// TODO enchantments
		return value
	}
	export function meleeDefenseVs(creature:Creature, attacker:Creature):number {
		// TODO target-dependent effects
		return meleeDefense(creature)
	}
	export function baseMeleeDamage(attacker:Creature):DamageSpec {
		let weapon = attacker.meleeWeapon.asWeapon!;
		let primary:DamageSpecEntry = {
			damage: weapon.damage,
			damageType: weapon.damageType,
			canCrit: true
		};
		primary.damage = primary.damage.withBonus(attacker.strMod);
		// TODO enchantments
		return [primary];
	}
	export function meleeDamageVs(attacker:Creature, target:Creature):DamageSpec {
		// TODO target-dependent effects
		return baseMeleeDamage(attacker)
	}
	// TODO customize teases - diff parts, preferences, perversion, skills
	export function teaseAttackVs(attacker:Creature, target:Creature):number {
		return attacker.chaMod;
	}
	export function teaseDefenseVs(creature:Creature, attacker:Creature):number {
		return creature.will;
	}
	export function teaseDamageVs(attacker:Creature, target:Creature):Dice {
		return Dices.x1d10.withBonus(attacker.chaMod)
	}
}

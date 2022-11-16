/*
 * Created by aimozg on 03.08.2022.
 */
import {CombatAction} from "../../engine/combat/CombatAction";
import {CombatController} from "../../engine/combat/CombatController";
import {MeleeAttackAction} from "../../engine/combat/actions/MeleeAttackAction";
import {PlayerCharacter} from "../../engine/objects/creature/PlayerCharacter";
import {Creature} from "../../engine/objects/Creature";
import {Damage, DamageSpec, DamageSpecEntry} from "../../engine/rules/Damage";
import {Game} from "../../engine/Game";
import {SkipCombatAction} from "../../engine/combat/actions/SkipCombatAction";
import {Dice, Dices} from "../../engine/math/Dice";
import {CombatRoll} from "../../engine/combat/CombatRoll";
import {Direction} from "../../engine/utils/gridutils";
import {StepAction} from "../../engine/combat/actions/StepAction";

export namespace CombatRules {

	export function postSetup() {}

	export function meleeAttackApCost(roll:CombatRoll):number {
		let cost = 1000;
		cost *= speedApFactor(roll.actor.spe);
		return Math.round(cost);
	}

	export function playerActions(player:PlayerCharacter, cc:CombatController):CombatAction<any>[] {
		let actions:CombatAction<any>[] = [];
		actions.push(new SkipCombatAction(player));
		// TODO targets
		actions.push(new MeleeAttackAction(player, cc.enemies[0]))
		for (let dir of Direction.Steps) {
			actions.push(new StepAction(player, dir.add(player.gobj!!)))
		}
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

	export function speedApFactor(speed:number):number {
		return 20/(15+speed);
	}

	export function speedApFactorMove(speed:number):number {
		return 10/(5+speed);
	}

	// TODO move to extension functions
	/**
	 * Attack rating with current melee weapon
	 */
	export function meleeAttack(attacker:Creature):number {
		let value = attacker.strMod
		return value
	}
	export function meleeAttackVs(attacker:Creature, target:Creature):number {
		// TODO target-dependent effects
		return meleeAttack(attacker)
	}

	export function defense(creature:Creature):number {
		let value = 5
		value += creature.dexMod
		value += creature.bodyArmor?.asArmor?.defenseBonus ?? 0
		// TODO armor
		// TODO enchantments
		return value
	}
	/**
	 * Melee defense rating
	 */
	export function meleeDefense(creature:Creature):number {
		return defense(creature)
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
		return creature.willpower;
	}
	export function teaseDamageVs(attacker:Creature, target:Creature):Dice {
		return Dices.x1d10.withBonus(attacker.chaMod)
	}
}

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

export namespace CombatRules {

	export function playerActions(player:PlayerCharacter, cc:CombatController):CombatAction<any>[] {
		let actions:CombatAction<any>[] = [];
		// TODO targets
		actions.push(new MeleeAttackAction(player, cc.enemies[0]))
		// TODO tease
		// TODO abilities
		return actions;
	}

	export function rollDamage(spec:DamageSpec, crit:boolean, critMultiplier:number):Damage[] {
		let rng = Game.instance.rng
		return spec.map(d=>({
			damage: Math.max(1, crit && d.canCrit ? d.damage.repeat(critMultiplier).roll(rng) : d.damage.roll(rng)),
			damageType: d.damageType
		}))
	}

	// TODO move to extension functions
	/**
	 * Attack rating with current mele weapon
	 */
	export function meleeAttack(attacker:Creature):number {
		let value = attacker.strMod
		// TODO weapon type-dependent
		// TODO enchantments
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
		// TODO armor
		// TODO enchantments
		return value
	}
	export function meleeDefenseVs(creature:Creature, attacker:Creature):number {
		// TODO target-dependent effects
		return meleeDefense(creature)
	}
	export function baseMeleeDamage(attacker:Creature):DamageSpec {
		let primary:DamageSpecEntry = {
			damage: attacker.meleeWeapon.asWeapon.damage,
			damageType: attacker.meleeWeapon.asWeapon.damageType,
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
}

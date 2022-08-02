/*
 * Created by aimozg on 29.07.2022.
 */
import {BattleContext} from "./BattleContext";
import {Creature} from "../objects/Creature";
import {Game} from "../Game";
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {LogManager} from "../logging/LogManager";
import {ComponentChildren, h} from "preact";
import {Fragment} from "preact/compat";
import {DamageType} from "../rules/DamageType";
import {tween} from "shifty";

const logger = LogManager.loggerFor("engine.combat.CombatController")

export interface CombatFlowResult {
	type: CombatFlowResultType;
	creature?: Creature;
}

export const enum CombatFlowResultType {
	NOTHING_HAPPENED,
	NEW_ROUND,
	PLAYER_ACTION,
	AI_ACTION,
	COMBAT_ENDED
}

export const enum AttackRollResult {
	/** critical miss (rolled 1) */
	CRITICAL_MISS,
	/** ordinary miss */
	MISS,
	/** ordinary hit */
	HIT,
	/** critical hit, confirmed */
	CRITICAL_HIT
}

export let TicksPerRound = 1000;
export let AnimationTime = 500;

export class CombatController {
	constructor(
		public readonly ctx: BattleContext,
		public readonly party: Creature[],
		public readonly enemies: Creature[]
	) {}

	public get rng() { return Game.instance.rng }
	private _ended = false;
	public get ended() { return this._ended }
	public roundNo = 0;
	public tickTime = 0;
	public get partyLost(): boolean { return this.party.every(c => !c.isAlive) }
	public get enemiesLost(): boolean { return this.enemies.every(c => !c.isAlive) }
	public get participants(): Creature[] { return [...this.party, ...this.enemies]}

	battleStart() {
		logger.info("battleStart {} vs {}", this.party, this.enemies)
		for (let p of this.participants) {
			this.prepareForCombat(p)
		}
		this.roundNo = 0;
		this.tickTime = TicksPerRound;
	}
	battleEnd() {
		if (this._ended) return
		logger.info("battleEnd")
		this._ended = true
		for (let p of this.participants) {
			this.cleanupAfterCombat(p)
		}
		this.ctx.battleEnded()
	}
	advanceTime(maxDT: number): CombatFlowResult {
		logger.trace("advanceTime {}.{} +{}", this.roundNo, this.tickTime, maxDT)
		if (this.partyLost || this.enemiesLost) return {type: CombatFlowResultType.COMBAT_ENDED}
		while (maxDT-- > 0) {
			// check new round start
			if (this.tickTime >= TicksPerRound) {
				return {type: CombatFlowResultType.NEW_ROUND}
			}
			// TODO execute scheduled events
			// find actor
			let nextActor = this.participants.find(c => c.isAlive && c.ap >= TicksPerRound)
			if (nextActor) {
				if (nextActor instanceof PlayerCharacter) {
					// TODO if player-controller, actually
					return {type: CombatFlowResultType.PLAYER_ACTION, creature: nextActor}
				} else {
					return {type: CombatFlowResultType.AI_ACTION, creature: nextActor}
				}
			}
			// advance aps
			for (let c of this.participants) {
				if (c.isAlive) c.ap++
			}
			this.tickTime++
		}
		return {type: CombatFlowResultType.NOTHING_HAPPENED}
	}
	async applyFlowResult(fr: CombatFlowResult) {
		if (fr.type === CombatFlowResultType.NOTHING_HAPPENED) {
			// do nothing, call site should schedule advanceTime call
			logger.trace("applyFlowResult {} {}", fr.type, fr.creature)
			return
		}
		logger.debug("applyFlowResult {} {}", fr.type, fr.creature)
		switch (fr.type) {
			case CombatFlowResultType.PLAYER_ACTION:
				// do nothing, call site should display player action menu
				break;
			case CombatFlowResultType.NEW_ROUND:
				await this.nextRound()
				break;
			case CombatFlowResultType.AI_ACTION:
				await this.performAIAction(fr.creature!!)
				break;
			case CombatFlowResultType.COMBAT_ENDED:
				this.battleEnd()
				break;
		}
	}

	async nextRound() {
		this.tickTime -= TicksPerRound
		this.roundNo++
		this.logInfo("Round " + this.roundNo + ".")
		// TODO advance effects
	}
	async performAIAction(actor: Creature) {
		logger.debug("performAIAction {}", actor.name)
		// TODO select random action
		let target = this.party.find(p => p.isAlive)
		await this.performMeleeAttack(actor, target)
		logger.debug("/performAIAction {}", actor.name)
	}

	/////////////////////
	// Combat messages //
	/////////////////////

	log(messageClass: string, message: ComponentChildren) {
		logger.info("{}", message)
		this.ctx.logPanel.append(<span className={"log-message " + (messageClass ?? "")}>{message}</span>)
	}

	logInfo(message: ComponentChildren) {
		this.log("-info", message)
	}

	logAction(c: Creature, action: ComponentChildren, joiner: string = ': ') {
		// TODO special hostile/friendly style?
		this.log("-action", <Fragment>
			<span className="--actor">{c.name.capitalize()}</span>{joiner}
			<span className="--action">{action}</span>
		</Fragment>)
	}

	logActionVs(actor: Creature, verb: ComponentChildren, target: Creature, action: ComponentChildren) {
		// TODO special hostile/friendly style?
		this.log("-action", <Fragment>
			<span className="--actor">{actor.name.capitalize()}</span>{" "}{verb}{" "}
			<span className="--actor">{target.name.capitalize()}</span>{": "}
			<span className="--action">{action}</span>
		</Fragment>)
	}

	////////////////////
	// Creature utils //
	////////////////////

	prepareForCombat(c: Creature) {
		logger.debug("prepareForCombat {}", c)
		// TODO clean combat buffs
		// TODO setup AI
		c.ap = this.rng.nextInt(TicksPerRound)
		this.logAction(c, "Initiative roll (" + c.ap + ").")
	}

	cleanupAfterCombat(c: Creature) {
		logger.debug("cleanupAfterCombat {}", c);
		// TODO clean combat buffs
		c.ap = 0;
	}

	////////////////////
	// Combat actions //
	////////////////////

	async performMeleeAttack(attacker: Creature, target: Creature) {
		logger.info("performMeleeAttack {} {}", attacker, target)
		attacker.ap -= 1000 // TODO melee attack ap cost
		// TODO animations
		// TODO abstract this out!!
		let attack = attacker.attack
		let attackText = attack === 0 ? "" : attack < 0 ? String(attack) : ("+" + attack)
		let defense = target.defense
		let toHit = defense - attack
		let attackRoll = this.rng.d20()
		let rslt: AttackRollResult
		let damageDice = attacker.weapon.baseDamage
		if (attackRoll === 1) {
			// TODO critical misses
			rslt = AttackRollResult.CRITICAL_MISS
			this.logActionVs(attacker, "attacks", target, ["critical miss (", attackRoll, ")"])
		} else if (attackRoll === 20) {
			// TODO critical hits
			rslt = AttackRollResult.CRITICAL_HIT
			this.logActionVs(attacker, "attacks", target, ["critical hit (", attackRoll, ")"])
			damageDice = damageDice.repeat(2) // TODO diff multiplier
		} else if (attackRoll >= toHit) {
			this.logActionVs(attacker, "attacks", target, [
				"hit (", attackRoll, attackText, " vs ", defense, ")"
			])
			rslt = AttackRollResult.HIT
		} else {
			this.logActionVs(attacker, "attacks", target, [
				"miss (", attackRoll, attackText, " vs ", defense, ")"
			])
			rslt = AttackRollResult.MISS
		}
		if (rslt === AttackRollResult.HIT || rslt === AttackRollResult.CRITICAL_HIT) {
			let damage = damageDice.roll(this.rng)
			await this.doDamage(target, damage, attacker.weapon.damageType, attacker)
		}
	}

	async doDamage(target: Creature, damage: number, damageType: DamageType, source: Creature|null) {
		logger.info("doDamage {} {} {} {}",target,damage,damageType,source)
		// TODO DR and other
		if (damage < 0) damage = 0;
		if (damage === 0) {
			this.log("", <Fragment>(<span class="text-damage-none">0</span>)</Fragment>)
		} else {
			this.log("", <Fragment>(<span class={"text-damage-" + damageType.cssSuffix}>{damage} {damageType.name}</span>)</Fragment>)
			await this.deduceHP(target, damage, source);
		}
	}
	async deduceHP(target: Creature, damage: number, source:Creature|null) {
		logger.info("deduceHP")
		let wasAlive = target.isAlive
		await this.animateHpChange(target, target.hp - damage)
		if (wasAlive && !target.isAlive) {
			await this.onDeath(target, source)
		}
	}
	/**
	 * Handle death of {@param creature}
	 * @param killer
	 */
	async onDeath(creature: Creature, killer: Creature|null) {
		logger.info("onDeath {} {}",creature,killer)
		if (killer) {
			this.log("-death",<Fragment><b>{creature.name}</b> is killed by <b>{killer.name}</b>.</Fragment>)
		} else {
			this.log("-death",<Fragment><b>{creature.name}</b> dies.</Fragment>)
		}
		// TODO death animation
		if (killer && killer instanceof PlayerCharacter) {
			await this.awardXpFor(killer, creature)
		}
	}
	/**
	 * Award {@param player} XP for defeating {@param victim}
	 */
	async awardXpFor(player: PlayerCharacter, victim:Creature) {
		logger.info("awardXpFor {} {}", victim)
		// TODO calculate xp from level
		let xp = 50
		if (xp > 0) {
			this.logInfo("+" + xp + " XP.")
			await this.animateXpChange(player, player.xp + xp)
			this.ctx.redraw()
		}
	}
	async animateHpChange(creature: Creature, hp2:number) {
		logger.debug("animateHpChange {} {}",creature, hp2)
		// TODO move to CombatAnimations or something
		let hp1 = creature.hp
		await (tween({
			from: {hp: hp1},
			to: {hp: hp2},
			duration: AnimationTime,
			render: ({hp}: { hp: number }) => {
				creature.hp = hp;
				this.ctx.redraw()
			}
		}) as PromiseLike<any>)
		creature.hp = hp2;
		this.ctx.redraw()
	}
	async animateXpChange(creature: PlayerCharacter, xp2:number) {
		logger.debug("animateXpChange {} {}",creature, xp2)
		// TODO move to CombatAnimations or something
		let xp1 = creature.xp
		await (tween({
			from: {xp: xp1},
			to: {xp: xp2},
			duration: AnimationTime,
			render: ({xp}: { xp: number }) => {
				creature.xp = xp;
				this.ctx.redraw()
			}
		}) as PromiseLike<any>)
		creature.xp = xp2;
		this.ctx.redraw()
	}
}

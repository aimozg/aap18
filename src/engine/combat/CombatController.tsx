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
import {tween} from "shifty";
import {CombatAction} from "./CombatAction";
import {Damage, DamageType} from "../rules/Damage";
import {coerce} from "../math/utils";
import {CombatRoll} from "./CombatRoll";
import {CombatRules} from "../../game/combat/CombatRules";
import {BattleGrid} from "./BattleGrid";

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
export let AnimationTimeFast = 250;
export let AnimationTimeVeryFast = 125;

export class CombatController {
	constructor(
		public readonly ctx: BattleContext,
	) {
		CombatRules.postSetup();
		this.grid = ctx.options.grid;
		for (let creature of [...this.party, ...this.enemies]) {
			if (creature.gobj?.grid === this.grid) continue;
			let pos = this.grid.randomEmptyCell(this.rng);
			if (!pos) throw new Error(`Nowhere to place ${creature.name}!`)
			this.grid.placeCreature(creature, pos);
		}
		// TODO for tiles and layout, use options-provided static map or generated
	}

	public readonly grid: BattleGrid;
	public readonly party: Creature[] = this.ctx.options.party
	public readonly enemies: Creature[] = this.ctx.options.enemies
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
		this.logbr()
		this.logInfo("Round " + this.roundNo + ".")
		// TODO advance effects
	}
	async performAIAction(actor: Creature) {
		logger.debug("performAIAction {}", actor.name)
		let action = actor.ai.performAI(this);
		await this.performAction(action);
		logger.debug("/performAIAction {}", actor.name)
	}

	/////////////////////
	// Combat messages //
	/////////////////////

	log(messageClass: string, message: ComponentChildren) {
		logger.info("{}", message)
		/*if (this._logmsg > 0) {
			this.ctx.logPanel.appendToLast(message)
		} else {*/
			this.ctx.logPanel.append(<span className={"log-message " + (messageClass ?? "")}>{message}</span>)
		/*}*/
	}

	/* TODO need to organize message with sufficient atomicity
	ex. A attacks B, deals 3 + 5 damage, kills, gets XP
	private _logmsg = 0;
	logStart(messageClass?:string) {
		this._logmsg++;
		this.ctx.logPanel.append(<span className={"log-message "+(messageClass??"")}/>)
	}
	logEnd() {
		this._logmsg--;
	}
	 */

	logbr() {
		this.ctx.logPanel.append(<br/>)
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
		c.gobj = null;
	}

	adjacent(c1: Creature, c2:Creature) {
		let go1 = c1.gobj;
		let go2 = c2.gobj;
		if (!go1 || !go2) return false;
		return this.grid.adjacent(go1, go2);
	}

	////////////////////
	// Combat actions //
	////////////////////

	// TODO move (partially) to CombatRoll.process()
	async processMeleeRoll(roll:CombatRoll):Promise<CombatRoll> {
		// Calculate params
		if (!roll.free) roll.ap = CombatRules.meleeAttackApCost(roll);
		roll.bonus = CombatRules.meleeAttackVs(roll.actor, roll.target);
		roll.dc = CombatRules.meleeDefenseVs(roll.target, roll.actor);
		roll.damageSpec = CombatRules.meleeDamageVs(roll.actor, roll.target);
		// Strike
		// TODO onStrike callback
		if (roll.ap > 0) {
			await this.deduceAP(roll.actor, roll.ap);
		}
		if (roll.roll === 0) {
			roll.roll = this.rng.d20();
		}
		if (roll.roll === 1 && roll.canCritMiss) {
			roll.hit = false;
			roll.critMiss = true;
		} else if (roll.roll === 20 && roll.canCritHit) {
			roll.hit = true;
			roll.critHit = true;
		} else {
			roll.hit = roll.roll + roll.bonus >= roll.dc;
		}
		// Hit
		if (roll.hit) {
			roll.damage = CombatRules.rollDamage(roll.damageSpec, roll.critHit, 2);
			await roll.onHit?.(roll, this);
			if (roll.hit && !roll.cancelled) {
				await this.doDamages(roll.target, roll.damage, roll.actor);
			}
		} else {
			// TODO onMiss callback
		}
		return roll;
	}

	async performAction<T>(action:CombatAction<T>):Promise<T> {
		logger.info("performAction {}", action)
		return await action.perform(this)
	}

	async doDamages(target: Creature, damage: Damage[], source: Creature|null) {
		for (let d of damage) {
			// TODO synchronize animations
			await this.doDamage(target, d.damage, d.damageType, source)
		}
	}
	async doDamage(target: Creature, damage: number, damageType: DamageType, source: Creature|null) {
		logger.info("doDamage {} {} {} {}",target,damage,damageType,source)
		if (damage < 0) damage = 0;
		let originalDamage = damage;
		// TODO conditioned DR, damage immunity/resistance/vulnerability
		let dr = coerce(target.dmgRedAll, 0, damage);
		damage -= dr
		if (damage < 0) damage = 0;
		let hint = ""
		if (dr > 0) {
			hint = ""+originalDamage+" - "+dr+" DR";
		}
		if (damage === 0) {
			this.log("", <Fragment>(<span class="text-damage-none" title={hint}>0</span>)</Fragment>)
		} else {
			this.log("", <Fragment>(<span class={"text-damage-" + damageType.cssSuffix} title={hint}>{damage} {damageType.name}</span>)</Fragment>)
			await this.deduceHP(target, damage, source);
		}
	}
	async doLustDamage(target: Creature, damage: number, source:Creature|null) {
		logger.info("doLustDamage {} {} {}",target,damage,source)
		if (damage < 0) damage = 0;
		// let originalDamage = damage;
		// TODO lust resistance
		if (damage === 0) {
			this.log("", <Fragment>(<span class="text-damage-none">0</span>)</Fragment>)
		} else {
			this.log("", <Fragment>(<span class="text-lust">{damage}</span>)</Fragment>)
			await this.increaseLP(target, damage, source);
		}
	}
	async deduceAP(creature:Creature, value:number) {
		value |= 0;
		logger.info("deduceAP {} {}",creature,value);
		// TODO parallelize and detach animation from model
		await this.animateValueChange(creature, "ap", creature.ap-value, AnimationTimeVeryFast)
	}
	async deduceEP(creature:Creature, value:number) {
		logger.info("deduceEP {} {}",creature,value);
		// TODO parallelize and detach animation from model
		await this.animateValueChange(creature, "ep", creature.ep-value, AnimationTimeVeryFast)
	}
	async deduceHP(target: Creature, damage: number, source:Creature|null) {
		logger.info("deduceHP {} {} {}",target,damage,source)
		let wasAlive = target.isAlive
		await this.animateValueChange(target, "hp", target.hp - damage)
		if (wasAlive && !target.isAlive) {
			// TODO consider handling death later, as an immediate follow-up event
			await this.onDeath(target, source)
		}
	}
	async increaseLP(target: Creature, change:number, source:Creature|null) {
		logger.info("increaseLP {} {} {}",target,change,source)
		// TODO do not instalose
		let wasAlive = target.isAlive
		await this.animateValueChange(target, "lp", target.lp + change)
		if (wasAlive && !target.isAlive) {
			// TODO consider handling death later, as an immediate follow-up event
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
			this.log("-death",<Fragment><b>{creature.name}</b> is defeated by <b>{killer.name}</b>.</Fragment>)
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
		logger.info("awardXpFor {} {}", player, victim)
		// TODO calculate xp from level
		let xp = 50
		if (xp > 0) {
			this.logInfo("+" + xp + " XP.")
			await this.animateValueChange(player, "xp", player.xp+xp)
			this.ctx.redraw()
		}
	}
	private async animateValueChange<
		T extends {[key in PROP]:number},
		PROP extends keyof T
		>(creature: T,
	      prop:PROP,
	      value2:number,
	      duration: number = AnimationTime) {
		logger.debug("animateValueChange {} {} {}",creature, prop, value2)
		// TODO move to CombatAnimations or something
		let value1 = creature[prop]
		await (tween({
			from: {value: value1},
			to: {value: value2},
			duration: duration,
			render: ({value}: { value: number }) => {
				(creature as {[key in PROP]:number})[prop] = value;
				this.ctx.redraw()
			}
		}) as PromiseLike<any>);
		(creature as {[key in PROP]:number})[prop] = value2;
		this.ctx.redraw()
	}
}

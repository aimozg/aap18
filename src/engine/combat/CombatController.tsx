/*
 * Created by aimozg on 29.07.2022.
 */
import {BattleContext} from "./BattleContext";
import {Creature} from "../objects/Creature";
import {Game} from "../Game";
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {LogManager} from "../logging/LogManager";
import {ComponentChildren, h, VNode} from "preact";
import {Fragment} from "preact/compat";
import {CombatAction} from "./CombatAction";
import {Damage, DamageType} from "../rules/Damage";
import {coerce} from "../math/utils";
import {CombatRoll} from "./CombatRoll";
import {CombatRules} from "../../game/combat/CombatRules";
import {BattleGrid} from "./BattleGrid";
import {mergeLoot} from "../objects/Loot";
import {Inventory} from "../objects/Inventory";
import {CoreConditions} from "../objects/creature/CoreConditions";
import {SkipCombatAction} from "./actions/SkipCombatAction";
import {CoreSkills} from "../objects/creature/CoreSkills";

const logger = LogManager.loggerFor("engine.combat.CombatController")

/**
 * * "starting" - preparing for battle
 * * "flow" - ongoing, time flows
 * * "animation" - animation in progress
 * * "npc" - before NPC action
 * * "pc" - waiting for player input
 * * "ended" - battle ended, waiting for player to click [Finish] and take loot
 * * "closed" - battle fully ended, loot given
 */
export type BattleState = "starting"|"flow"|"animation"|"npc"|"pc"|"ended"|"closed";

/**
 * * "victory" - player won
 * * "defeat" - player lost
 * * "draw" - player ran away, both KO'd, or battle was interrupted
 * * "cancelled" - battle did not finish properly
 */
export type BattleResultType = "victory"|"defeat"|"draw"|"cancelled";
export interface BattleResult {
	type: BattleResultType;
	lust:boolean;
}

export let TicksPerRound = 1000;
export let ApToAct = 1000;
export let AnimationTime = 500;
export let AnimationTimeFast = 250;
export let AnimationTimeVeryFast = 125;

export function logref(creature:Creature): VNode {
	return <span class="--actor">{creature.name.capitalize()}</span>
}

export class CombatController {
	constructor(
		public readonly ctx: BattleContext,
	) {
		CombatRules.postSetup();
		this.grid = ctx.settings.grid;
		for (let creature of [...this.party, ...this.enemies]) {
			// TODO put them on different sides
			if (creature.gobj?.grid === this.grid) continue;
			let pos = this.grid.randomEmptyCell(this.rng);
			if (!pos) throw new Error(`Nowhere to place ${creature.name}!`)
			this.grid.placeCreature(creature, pos);
		}
	}

	public readonly grid: BattleGrid;
	public readonly party: Creature[] = this.ctx.settings.party
	public readonly enemies: Creature[] = this.ctx.settings.enemies
	public ownSide(creature:Creature):Creature[] {
		if (this.party.includes(creature)) return this.party;
		if (this.enemies.includes(creature)) return this.enemies;
		throw new Error("Not a combatant: "+creature);
	}
	public otherSide(creature:Creature):Creature[] {
		if (this.party.includes(creature)) return this.enemies;
		if (this.enemies.includes(creature)) return this.party;
		throw new Error("Not a combatant: "+creature);
	}

	public get rng() { return Game.instance.rng }

	public get ended() { return this.state === "ended" || this.state === "closed" }

	private _state:BattleState = "starting";
	get state(): BattleState { return this._state; }
	private set state(value: BattleState) {
		if (value !== this._state) {
			let oldState = this._state;
			logger.debug("state changed {} to {}",oldState,value);
			this._state = value;
			this.logbr();
			this.ctx.stateChanged(value, oldState);
		}
	}

	private _nextActor:Creature|null = null;
	get nextActor(): Creature | null { return this._nextActor; }

	private _result:BattleResult = {type:"cancelled", lust:false};
	get result(): BattleResult { return this._result }

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
		switch (this.ctx.settings.ambushed) {
			case "enemies":
				this.logInfo("You're sneaking!");
				for (let c of this.party) c.setCondition(CoreConditions.Stealth);
				for (let c of this.enemies) c.setCondition(CoreConditions.Unaware);
				break;
			case "party":
				// TODO what to do when party is ambushed? Give bonus AP?
				// for (let c of this.enemies) c.setCondition(CoreConditions.Stealth);
				// for (let c of this.party) c.setCondition(CoreConditions.Unaware);
				break;
		}
		this.roundNo = 0;
		this.tickTime = TicksPerRound;
		this.state = "flow"
	}

	battleEnd() {
		if (this.ended) throw new Error(`Cannot battleEnd() in ${this.state}`);
		logger.info("battleEnd")
		this.state = "ended";
		if (this.partyLost && this.enemiesLost) {
			this._result.type = "draw"
		} else if (this.partyLost) {
			this._result.type = "defeat"
			this._result.lust = this.party.every(p=>p.hasCondition(CoreConditions.Seduced));
		} else if (this.enemiesLost) {
			this._result.type = "victory"
			this._result.lust = this.enemies.every(p=>p.hasCondition(CoreConditions.Seduced));
		} else {
			this._result.type = "draw"
		}
	}

	async battleClose() {
		if (this.state !== "ended") throw new Error(`Cannot battleClose() in ${this.state}`)
		logger.info("battleClose")
		for (let p of this.participants) {
			this.cleanupAfterCombat(p)
		}
		await this.awardLoot();
		this.state = "closed";
	}

	/** End battle or switch to "flow" */
	private flow() {
		if (this.partyLost || this.enemiesLost) {
			this.battleEnd();
			return;
		}
		this.state = "flow";
	}

	async advanceTime(maxDT: number) {
		logger.trace("advanceTime {} {}.{} +{}", this.state, this.roundNo, this.tickTime, maxDT)
		if (this.state === "npc") {
			await this.performAIAction(this._nextActor!);
			return;
		}
		if (this.state !== "flow") {
			throw new Error(`Cannot advanceTime() in ${this.state} state`)
		}
		if (this.partyLost || this.enemiesLost) {
			this.battleEnd();
			return
		}
		while (maxDT-- > 0) {
			// check new round start
			if (this.tickTime >= TicksPerRound) {
				await this.nextRound();
				return
			}
			// TODO execute scheduled events
			// find actor
			let nextActor = this.participants.find(c => c.isAlive && c.ap >= ApToAct)
			if (nextActor) {
				if (nextActor instanceof PlayerCharacter) {
					// TODO if player-controller, actually
					this.state = "pc"
					this._nextActor = nextActor
					return
				} else {
					this._nextActor = nextActor;
					this.state = "npc";
					return
				}
			}
			// advance aps
			for (let c of this.participants) {
				if (c.isAlive) c.ap++
			}
			this.tickTime++
		}
	}

	async doSingleStealthCheck(spotter:Creature, sneaker:Creature) {
		logger.info("doSingleStealthCheck {} {}", spotter, sneaker);
		if (!spotter.isAlive) return;
		let spotSkill = spotter.skillValue(CoreSkills.Spot);
		let stealthSkill = sneaker.skillValue(CoreSkills.Stealth);

		let roll = this.rng.d20();
		let bonus = spotSkill;
		let dc = 10 + stealthSkill;
		// TODO critical success/failure?
		let success = roll + bonus >= dc
		this.logSkillCheck(roll, bonus, dc, <Fragment>
				{logref(spotter)}{' '}Spot vs {logref(sneaker)}{' '}Stealth check
			</Fragment>);
		if (success) {
			await this.noticeCreature(sneaker);
		}
	}
	async doFullStealthCheck(creature:Creature) {
		logger.debug("doFullStealthCheck {}", creature)
		for (let spotter of this.otherSide(creature)) {
			if (!creature.hasCondition(CoreConditions.Stealth)) break;
			await this.doSingleStealthCheck(spotter, creature);
		}
	}
	async noticeCreature(creature:Creature) {
		logger.debug("noticeCreature {}",creature);
		if (creature.removeCondition(CoreConditions.Stealth)) {
			this.logInfo(<Fragment>{logref(creature)} is found!</Fragment>);
		}
		for (let enemy of this.otherSide(creature)) {
			if (enemy.removeCondition(CoreConditions.Unaware)) {
				this.logInfo(<Fragment>{logref(enemy)} is alerted!</Fragment>)
			}
		}
	}

	async nextRound() {
		logger.info("nextRound()")

		this.tickTime -= TicksPerRound
		this.roundNo++

		this.logbr()
		this.logInfo("Round " + this.roundNo + ".")
		this.logbr()

		for (let creature of this.participants) {
			if (creature.hasCondition(CoreConditions.Stealth)) {
				await this.doFullStealthCheck(creature);
			}
		}
		// TODO advance effects
	}

	async performAIAction(actor: Creature) {
		logger.debug("performAIAction {}", actor.name)
		let action = actor.canAct ? actor.ai.performAI(this) : new SkipCombatAction(actor);
		await this.performAction(action);
		logger.debug("/performAIAction {}", actor.name)
	}

	/////////////////////
	// Combat messages //
	/////////////////////

	private logHasNoBr = false;
	log(messageClass: string, message: ComponentChildren) {
		logger.info("{}", message)
		this.logHasNoBr = true;
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
		if (this.logHasNoBr) {
			this.logHasNoBr = false;
			this.ctx.logPanel.append(<br/>)
		}
	}

	logInfo(message: ComponentChildren) {
		this.log("-info", message)
	}

	logAction(c: Creature, action: ComponentChildren, joiner: string = ': ') {
		// TODO special hostile/friendly style?
		this.log("-action", <Fragment>
			{logref(c)}{joiner}<span className="--action">{action}</span>
		</Fragment>)
	}

	logActionVs(actor: Creature, verb: ComponentChildren, target: Creature, action: ComponentChildren) {
		// TODO special hostile/friendly style?
		this.log("-action", <Fragment>
			{logref(actor)}{" "}{verb}{" "}{logref(target)}{": "}
			<span className="--action">{action}</span>
		</Fragment>)
	}
	logSkillCheck(roll:number,bonus:number,dc:number,name:ComponentChildren) {
		let success = roll + bonus >= dc
		let className = success ? "text-roll-success" : "text-roll-fail";
		this.log("-check", <Fragment>
			[{name}: <span class={className}>{success?"Success":"Failure"} ({roll}{bonus.signed()} vs {dc})</span>]
		</Fragment>)
	}

	////////////////////
	// Creature utils //
	////////////////////

	prepareForCombat(c: Creature) {
		logger.debug("prepareForCombat {}", c)
		// TODO setup AI
		c.ap = this.rng.nextInt(TicksPerRound)
		this.logAction(c, "Initiative roll (" + c.ap + ").")
	}

	cleanupAfterCombat(c: Creature) {
		logger.debug("cleanupAfterCombat {}", c);
		// TODO clean combat buffs
		for (let cc of c.conditions) {
			if (cc.combatOnly) c.removeCondition(cc);
		}
		c.ap = 0;
		c.gobj = null;
	}

	adjacent(c1: Creature, c2: Creature) {
		let go1 = c1.gobj;
		let go2 = c2.gobj;
		if (!go1 || !go2) return false;
		return this.grid.adjacent(go1, go2);
	}

	////////////////////
	// Combat actions //
	////////////////////

	// TODO move (partially) to CombatRoll.process()
	async processMeleeRoll(roll: CombatRoll): Promise<CombatRoll> {
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
				if (roll.critHit) {
					this.logActionVs(roll.actor, "attacks", roll.target, <Fragment><span title={""+roll.roll}>critical hit</span>!</Fragment>)
				} else {
					this.logActionVs(roll.actor, "attacks", roll.target, <Fragment><span title={""+roll.roll+roll.bonus.signed()+" vs "+roll.dc}>hit</span>.</Fragment>)
				}
				await this.doDamages(roll.target, roll.damage, roll.actor);
			}
		} else {
			// TODO onMiss callback
			if (roll.critMiss) {
				this.logActionVs(roll.actor, "attacks", roll.target,
					<Fragment><span title={""+roll.roll}>critical miss</span>!</Fragment>)
			} else {
				this.logActionVs(roll.actor, "attacks", roll.target, <Fragment><span title={""+roll.roll+roll.bonus.signed()+" vs "+roll.dc}>miss</span>.</Fragment>)
			}
		}
		if (roll.target.hasCondition(CoreConditions.Unaware)) {
			roll.target.removeCondition(CoreConditions.Unaware);
		}
		return roll;
	}

	async performAction<T>(action: CombatAction<T>): Promise<T> {
		logger.info("performAction {}", action)
		let result = await action.perform(this);
		if (action.actor.hasCondition(CoreConditions.Stealth) && action.removeStealth) {
			await this.noticeCreature(action.actor);
		}
		this.flow()
		return result
	}

	async doDamages(target: Creature, damage: Damage[], source: Creature | null) {
		for (let d of damage) {
			// TODO synchronize animations
			await this.doDamage(target, d.damage, d.damageType, source)
		}
	}

	async doDamage(target: Creature, damage: number, damageType: DamageType, source: Creature | null) {
		logger.info("doDamage {} {} {} {}", target, damage, damageType, source)
		if (damage < 0) damage = 0;
		let originalDamage = damage;
		// TODO conditioned DR, damage immunity/resistance/vulnerability
		let dr = coerce(target.dmgRedAll, 0, damage);
		damage -= dr
		if (damage < 0) damage = 0;
		let hint = ""
		if (dr > 0) {
			hint = "" + originalDamage + " - " + dr + " DR";
		}
		if (damage === 0) {
			this.log("", <Fragment>(<span class="text-damage-none" title={hint}>0</span>)</Fragment>)
		} else {
			this.log("", <Fragment>(<span class={"text-damage-" + damageType.cssSuffix}
			                              title={hint}>{damage} {damageType.name}</span>)</Fragment>)
			await this.deduceHP(target, damage, source);
		}
	}

	async doLustDamage(target: Creature, damage: number, source: Creature | null) {
		logger.info("doLustDamage {} {} {}", target, damage, source)
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

	async deduceAP(creature: Creature, value: number) {
		value |= 0;
		logger.info("deduceAP {} {}", creature, value);
		this.ctx.animateValueChange(creature, "ap", creature.ap - value, AnimationTimeVeryFast);
		creature.ap -= value;
	}

	async deduceEP(creature: Creature, value: number) {
		logger.info("deduceEP {} {}", creature, value);
		// TODO move animation to ctrl
		this.ctx.animateValueChange(creature, "ep", creature.ep - value, AnimationTimeVeryFast);
		creature.ctrl.modEp(-value);
	}

	async deduceHP(target: Creature, damage: number, source: Creature | null) {
		logger.info("deduceHP {} {} {}", target, damage, source)
		let wasAlive = target.isAlive
		this.ctx.animateValueChange(target, "hp", target.hp - damage, AnimationTime)
		target.ctrl.modHp(-damage);
		if (target.hp <= 0) target.setCondition(CoreConditions.Defeated);
		if (wasAlive && !target.isAlive) {
			// TODO consider handling death later, as an immediate follow-up event
			await this.onDeath(target, source)
		}
	}

	async increaseLP(target: Creature, change: number, source: Creature | null) {
		logger.info("increaseLP {} {} {}", target, change, source)
		//let wasAlive = target.isAlive
		this.ctx.animateValueChange(target, "lp", target.lp + change, AnimationTime)
		target.ctrl.modLp(change);
	}

	/**
	 * Handle death of {@param creature}
	 * @param killer
	 */
	async onDeath(creature: Creature, killer: Creature | null) {
		logger.info("onDeath {} {}", creature, killer)
		if (killer) {
			this.log("-death", <Fragment><b>{creature.name}</b> is defeated by <b>{killer.name}</b>.</Fragment>)
		} else {
			this.log("-death", <Fragment><b>{creature.name}</b> dies.</Fragment>)
		}
		// TODO death animation
		if (killer && killer instanceof PlayerCharacter) {
			await this.awardXpFor(killer, creature)
		}
	}

	/**
	 * Award {@param player} XP for defeating {@param victim}
	 */
	async awardXpFor(player: PlayerCharacter, victim: Creature) {
		logger.info("awardXpFor {} {}", player, victim)
		// TODO calculate xp from level
		let xp = 50
		if (xp > 0) {
			this.logInfo("+" + xp + " XP.")
			this.ctx.animateValueChange(player, "xp", player.xp + xp, AnimationTime)
			player.ctrl.addXp(xp);
			this.ctx.redraw()
		}
	}

	async awardLoot() {
		let loot = mergeLoot(this.enemies.map(e=>e.loot));
		logger.info("awardLoot rolled money = {} items = {}", loot.money, loot.items);
		let receiver = this.ctx.player;
		// TODO +XXXX floating number for gold
		receiver.money += loot.money;
		// TODO this isn't displayed properly!
		this.logInfo(`You receive ${loot.money} gold.`);
		if (loot.items.length > 0) {
			await Game.instance.gameController.openTransferMenu(
				Inventory.wrap(loot.items, "Loot"),
				{ /*use: false, equip: false, unequip: false*/ }
			)
		}
	}
}

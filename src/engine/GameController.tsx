/*
 * Created by aimozg on 03.07.2022.
 */
import {Game} from "./Game";
import {NewGameScreen} from "./chargen/NewGameScreen";
import {LogManager} from "./logging/LogManager";
import {SceneContext} from "./scene/SceneContext";
import {TextOutput} from "./text/output/TextOutput";
import {PlayerCharacter} from "./objects/creature/PlayerCharacter";
import {StateManager} from "./state/StateManager";
import {Place} from "./place/Place";
import {NullGameContext} from "./state/GameContext";
import {BattleContext, BattleOptions, BattleSettings} from "./combat/BattleContext";
import {Random} from "./math/Random";
import {BattleGrid} from "./combat/BattleGrid";
import {GridPos} from "./utils/gridutils";
import {PlaceContext} from "./place/PlaceContext";
import {Creature} from "./objects/Creature";
import {Item} from "./objects/Item";
import {Inventory} from "./objects/Inventory";
import {InventoryScreen, InventoryScreenOptions} from "./ui/screens/InventoryScreen";
import {Scene, SceneFn} from "./scene/Scene";
import {ComponentChildren, h} from "preact";
import {Skill} from "./objects/creature/Skill";
import {SkillXp} from "../game/xp";

const logger = LogManager.loggerFor("engine.GameController");

/**
 * Governs core game flow - load, restart, switch between modes
 */
export class GameController {
	constructor(readonly game:Game) {
	}

	get state(): StateManager { return this.game.state }
	get player(): PlayerCharacter { return this.state.player }
	get rng(): Random { return this.game.rng }

	async loadAutosave():Promise<void> {
		logger.info("loadAutosave");
		let data = await this.game.saveManager.loadAutosaveData();
		await this.state.importGameState(data);
		// TODO show post-load game screen
		throw new Error("Not implemented yet");
	}

	/**
	 * To be called from main menu
	 * @return new player character
	 */
	async startNewGame():Promise<boolean> {
		logger.info("startNewGame");
		this.state.clearGameState();
		let ngs = new NewGameScreen();
		await this.game.screenManager.replaceTop(ngs, "fade-fast");
		let playerCharacter = await ngs.display();
		if (!playerCharacter) {
			await this.game.screenManager.closeTop("fade");
			return false;
		} else {
			this.state.setupPlayer(playerCharacter);
			await this.beginStory();
			return true;
		}
	}

	async beginStory():Promise<void> {
		logger.info("beginStory")
		let ss = this.game.screenManager.gameScreen;
		await this.game.screenManager.replaceTop(ss, 'fade-fast');
		this.game.screenManager.sharedPlayerPanel.creature = this.player;
		await this.playScene(this.game.idata.startingSceneId);
		this.showGameScreen()
	}

	displayMessage(message:ComponentChildren) {
		if (typeof message === "string") {
			this.game.screenManager.sharedTextPanel.append(<div class="text-hl">{message}</div>)
		} else {
			this.game.screenManager.sharedTextPanel.append(message)
		}
	}

	async playScene(scene:string|Scene):Promise<string> {
		scene = this.game.data.scene(scene);
		return this.playSceneImpl(scene.resId, scene.sceneFn);
	}
	async playSceneFn(fn:SceneFn):Promise<string> {
		return this.playSceneImpl("<ephemeral scene>", fn)
	}
	private async playSceneImpl(sceneId:string, sceneFn:SceneFn):Promise<string> {
		logger.info("playSceneFn {}", sceneId);
		let context:SceneContext = new SceneContext(sceneId, sceneFn, new TextOutput());
		this.state.pushGameContext(context);
		this.showGameScreen();
		return context.promise;
	}

	/**
	 * Depending on game mode & state, display current screen
	 */
	showGameScreen() {
		if (this.queuedSGS) return;
		this.queuedSGS = true;
		setTimeout(()=>this.showGameScreen0());
	}
	private queuedSGS = false;
	animationFrame(dt:number, time:number):void{
		this.state.currentContext().animationFrame?.(dt,time);
	}
	showGameScreen0() {
		this.queuedSGS = false;
		let context = this.state.flushGameContext();
		logger.debug("showGameScreen {}",context)
		let gameScreen = this.game.screenManager.gameScreen;
		gameScreen.keyboardEventListener = context.onKeyboardEvent?.bind(context);
		if (context instanceof NullGameContext) {
			this.state.pushGameContext(new PlaceContext(this.player.place));
			this.showGameScreen();
			return;
		}
		// PlaceContext inherits SceneContext, this check should be first
		if (context instanceof PlaceContext) {
			this.state.lastBattle = null;
			if (context.place === Place.Limbo) {
				// TODO rescue?
				throw new Error("Player stuck in limbo")
			}
			gameScreen.applyLayout(context.layout);
			context.display().then(()=>this.showGameScreen());
			return;
		}
		if (context instanceof SceneContext) {
			context.output = new TextOutput();
			gameScreen.applyLayout(context.layout);
			context.playCurrentScene().then(()=>this.showGameScreen());
			return;
		}
		if (context instanceof BattleContext) {
			gameScreen.applyLayout(context.layout);
			context.update();
			return;
		}
		// TODO rescue
		throw new Error("Unknown game context")
	}

	/**
	 * Teleport player to specified location
	 * @param placeRef
	 */
	placePlayer(placeRef:string|Place) {
		logger.debug("placePlayer {}", placeRef);
		let place = this.game.data.place(placeRef);
		this.player.place.onLeave();
		this.player.place = place;
		place.onEnter();
	}

	startBattle(options:BattleOptions):BattleContext {
		let party = options.party ?? [options.player ?? this.player];
		let enemies = options.enemies;

		// Load map from provided options, or generate one
		let cells = options.map?.cells;
		let height = cells?.length ?? 8;
		let width = cells?.[0]?.length ?? 8;
		let grid: BattleGrid = new BattleGrid(width, height);
		if (cells) {
			let partySpawnPoints:GridPos[] = [];
			let enemySpawnPoints:GridPos[] = [];
			let mappings = options.map?.mappings;
			for (let y = 0; y < grid.height; y++) {
				for (let x = 0; x < grid.width; x++) {
					let data = grid.data({x,y});
					let code = cells[y][x];
					if (mappings) {
						let mapping = mappings[code];
						if (!mapping) throw new Error(`No mapping for code '${code}'`);
						data.tile = this.game.data.tile(mapping.tile);
						if (mapping.spawn === "enemy") enemySpawnPoints.push({x,y});
						else if (mapping.spawn === "party") partySpawnPoints.push({x,y});
						if (mapping.visible !== undefined) data.visible = mapping.visible;
					} else {
						data.tile = this.game.data.tileByChar(code);
					}
				}
			}
			for (let c of party) {
				let pos = this.rng.pickOrNull(partySpawnPoints);
				if (!pos) break;
				grid.placeCreature(c, pos);
			}
			for (let c of enemies) {
				let pos = this.rng.pickOrNull(enemySpawnPoints);
				if (!pos) break;
				grid.placeCreature(c, pos);
			}
		} else {
			// TODO generate random grid here
		}

		let afterEnd = async (battle:BattleContext)=>{
			logger.debug("battle {} afterEnd",battle)
			let then = options.then;
			if (!then) return;
			if (typeof then === 'string' || then instanceof Scene) {
				await this.playScene(then);
			} else if (typeof then === 'function') {
				await this.playSceneFn(then);
			} else {
				if (battle.isDefeat) {
					if ('defeat' in then) {
						await this.playScene(then.defeat)
					} else if (battle.isLustDefeat) {
						await this.playScene(then.lustDefeat)
					} else {
						await this.playScene(then.hpDefeat)
					}
				} else {
					// TODO retreat, draw
					if ('victory' in then) {
						await this.playScene(then.victory)
					} else if (battle.isLustDefeat) {
						await this.playScene(then.lustVictory)
					} else {
						await this.playScene(then.hpVictory)
					}
				}
			}
		}
		let settings: BattleSettings = {
			player: options.player ?? this.player,
			party: party,
			enemies: enemies,
			grid,
			ambushed: options.ambushed,
			afterEnd
		}
		let ctx = new BattleContext(settings);
		this.state.lastBattle = ctx;
		this.state.pushGameContext(ctx);
		this.showGameScreen();
		return ctx;
	}

	battleEnded(battle:BattleContext) {
		battle.settings.afterEnd(battle).then(()=>{
			this.showGameScreen();
		});
	}

	async restoreHp(creature:Creature, amount:number, output?:TextOutput) {
		if (amount <= 0) return;
		// TODO animate hp bar
		creature.ctrl.modHp(amount);
		if (output) {
			// TODO instead of output, use shared displayMessage
			output.selectActor(creature);
			output.print(`<hl>[You]</hl> [are] healed (<text-hp>${amount}</text-hp>). `);
			output.deselectActor();
		}
	}

	recoverPlayer() {
		let player = this.player;
		player.ctrl.recoverStats();
	}

	async unequipToInventory(creature:Creature, item:Item) {
		// TODO EquipmentSlot system
		// TODO invoke item's callback, check if unequipable
		if (item === creature.mainHandItem) {
			creature.setMainHandItem(null);
			creature.addToInventory(item);
			return;
		}
		if (item === creature.bodyArmor) {
			creature.setBodyArmor(null);
			creature.addToInventory(item);
			return;
		}
		throw new Error(`Cannot unequip ${item}, it is not in any slot.`)
	}
	async equipFromInventory(creature:Creature, item:Item) {
		if (!creature.inventory.includes(item)) throw new Error(`Creature do not carry ${item}`);
		await this.equipItem(creature, item);
		creature.removeFromInventory(item);
	}

	async equipItem(creature: Creature, item: Item) {
		// TODO EquipmentSlot system
		// TODO check if equipable, invoke item's callback
		if (item.isWeapon) {
			if (creature.mainHandItem) {
				await this.unequipToInventory(creature, creature.mainHandItem);
			}
			creature.setMainHandItem(item);
			return;
		}
		if (item.isArmor) {
			if (creature.bodyArmor) {
				await this.unequipToInventory(creature, creature.bodyArmor);
			}
			creature.setBodyArmor(item);
			return;
		}
		throw new Error(`Cannot equip ${item} - invalid type`)
	}

	async consumeFromInventory(creature: Creature, item: Item, output?: TextOutput) {
		if (!creature.inventory.includes(item)) throw new Error(`Creature does not carry ${item}`);
		await this.consumeItem(creature, item, output);
		creature.removeFromInventory(item);
	}

	async consumeItem(creature: Creature, item: Item, output?: TextOutput) {
		let cc = item.asConsumable;
		if (!cc) throw new Error(`Cannot consume ${item}`);
		for (let effect of cc.effects) {
			await effect.apply(this, creature, output)
		}
	}
	async openTransferMenu(inv: Inventory|null, options: Partial<InventoryScreenOptions> = {}) {
		await new InventoryScreen(this.player, inv, options).showModal();
		this.game.screenManager.sharedPlayerPanel.update();
	}
	useSkill(options:UseSkillOptions):SkillCheckResult {
		let actor = options.actor ?? this.player;
		let roll = options.roll ?? this.rng.d20();
		let bonus = actor.skillLevel(options.skill);
		let dc = options.dc;
		let diff = roll+bonus - dc;
		let critType = options.crit ?? "no";
		let xp = options.xp ?? SkillXp.NORMAL;

		let result:SkillCheckResult = {success:false,crit:false};
		result.success = diff >= 0;
		if (critType === "dice") {
			if (roll === 1) result = {success:true,crit:true};
			else if (roll === 20) result = {success:false,crit:true};
		} else if (critType === "diff") {
			if (diff <= -10) result = {success:false,crit:true};
			else if (diff >= 10) result = {success:true,crit:true};
		}
		if (options.log ?? true) {
			let className = result.success ?
				(result.crit ? 'text-roll-critsuccess' : 'text-roll-success') :
				(result.crit ? 'text-roll-critfail' : 'text-roll-fail');
			let name = options.name ?? `${options.skill.name} check`;
			let numbers = "";
			if (options.logNumbers ?? true) {
				numbers = ` (${roll}${bonus.signed()} vs DC ${dc})`;
			}
			let resultName = result.success ?
				(result.crit ? 'Critical Success' : 'Success') :
				(result.crit ? 'Critical Failure' : 'Failure');
			this.displayMessage(<p class='text-roll-skill'>[{name}: <span class={className}>{resultName}{numbers}</span>]</p>)
		}
		if (result.success && xp > 0) {
			actor.ctrl.giveSkillXp(options.skill, xp);
		}
		return result;
	}
}

export type SkillCheckResult = {success:boolean,crit:boolean};
/**
 * * no - no crit fails/successes
 * * dice - crit fail when d20 = 1, crit success when d20 = 20
 * * diff - crit fail when total is lower than DC by 10 or more, success when higher by 10 or more
 */
export type SkillCritType = 'no'|'dice'|'diff';
export interface UseSkillOptions {
	/** default = player */
	actor?: Creature;
	skill: Skill;
	dc: number;
	/** skill xp to give, default = SkillXp.NORMAL */
	xp?: number;
	/** predefined roll value, default = ctx.d20() */
	roll?: number;
	/** default = "no" */
	crit?: SkillCritType;
	/** log, default = true */
	log?: boolean;
	/** log numbers, default = true */
	logNumbers?: boolean;
	/** skill usage text, default "SkillName check" */
	name?: string;
}

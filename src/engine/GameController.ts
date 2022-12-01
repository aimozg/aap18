/*
 * Created by aimozg on 03.07.2022.
 */
import {Game} from "./Game";
import {NewGameScreen} from "../game/ui/NewGameScreen";
import {LogManager} from "./logging/LogManager";
import {SceneContext} from "./scene/SceneContext";
import {TextOutput} from "./text/output/TextOutput";
import {PlayerCharacter} from "./objects/creature/PlayerCharacter";
import {StateManager} from "./state/StateManager";
import {Place} from "./place/Place";
import {NullGameContext} from "./state/GameContext";
import {ScenePanel} from "./ui/panels/ScenePanel";
import {BattleContext, BattleOptions, BattleSettings} from "./combat/BattleContext";
import {Random} from "./math/Random";
import {BattleGrid} from "./combat/BattleGrid";
import {GridPos} from "./utils/gridutils";
import {PlaceContext} from "./place/PlaceContext";
import {Creature} from "./objects/Creature";
import {Item} from "./objects/Item";
import {InteractiveTextOutput} from "./text/output/InteractiveTextOutput";
import {Inventory} from "./objects/Inventory";
import {InventoryScreen, InventoryScreenOptions} from "./ui/screens/InventoryScreen";

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

	async playScene(scene:string):Promise<string> {
		logger.info("playScene {}", scene);
		let context:SceneContext = new SceneContext(scene, new InteractiveTextOutput(new ScenePanel()));
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
		if (context instanceof SceneContext) {
			context.output = new InteractiveTextOutput(new ScenePanel());
			gameScreen.applyLayout(context.layout);
			context.playCurrentScene().then(()=>this.showGameScreen());
			return;
		}
		if (context instanceof PlaceContext) {
			if (context.place === Place.Limbo) {
				// TODO rescue?
				throw new Error("Player stuck in limbo")
			}
			gameScreen.applyLayout(context.layout);
			context.display().then(()=>this.showGameScreen());
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
	 * @param placeId
	 */
	placePlayer(placeId:string) {
		logger.debug("placePlayer {}", placeId);
		let place = this.game.data.place(placeId);
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

		let settings: BattleSettings = {
			player: options.player ?? this.player,
			party: party,
			enemies: enemies,
			grid,
			ambushed: options.ambushed
		}
		let ctx = new BattleContext(settings);
		this.state.pushGameContext(ctx);
		this.showGameScreen();
		return ctx;
	}

	async restoreHp(creature:Creature, amount:number, output?:TextOutput) {
		if (amount <= 0) return;
		// TODO animate hp bar
		creature.ctrl.modHp(amount);
		if (output) {
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
}

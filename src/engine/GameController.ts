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
import {Place} from "./objects/Place";
import {NullGameContext, PlaceContext} from "./state/GameContext";
import {ScenePanel} from "./ui/panels/ScenePanel";
import {BattleContext} from "./combat/BattleContext";
import {Creature} from "./objects/Creature";

const logger = LogManager.loggerFor("engine.GameController");

/**
 * Governs core game flow - load, restart, switch between modes
 */
export class GameController {
	constructor(readonly game:Game) {
	}

	get state(): StateManager { return this.game.state }
	get player(): PlayerCharacter { return this.state.player }

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
		await this.playScene(this.game.idata.startingSceneId);
		this.showGameScreen()
	}

	async playScene(scene:string):Promise<string> {
		logger.info("playScene {}", scene);
		let context:SceneContext = new SceneContext(scene, new TextOutput(new ScenePanel()));
		this.state.pushGameContext(context);
		this.showGameScreen();
		return context.promise;
	}

	/**
	 * Depending on game mode & state, display current screen
	 */
	showGameScreen() {
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
			context.output = new TextOutput(new ScenePanel());
			gameScreen.applyLayout(context.layout);
			context.play(context.sceneId).then(()=>this.showGameScreen());
			return;
		}
		if (context instanceof PlaceContext) {
			if (context.place === Place.Limbo) {
				// TODO rescue?
				throw new Error("Player stuck in limbo")
			}
			context.place.display().then().then(()=>this.showGameScreen());
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

	startBattle(enemies:Creature[]):BattleContext {
		let ctx = new BattleContext(this.player, [this.player], enemies);
		this.state.pushGameContext(ctx);
		this.showGameScreen();
		return ctx;
	}

	recoverPlayer() {
		let player = this.player;
		player.hp = player.hpMax;
		player.ep = player.epMax;
		player.lp = 0;
	}
}

/*
 * Created by aimozg on 03.07.2022.
 */
import {ScreenManager} from "./ui/ScreenManager";
import {StateManager} from "./state/StateManager";
import {SaveManager} from "./state/SaveManager";
import {ResourceManager} from "./res/ResourceManager";
import {MainMenuScreen} from "./ui/screens/MainMenuScreen";
import {GameController} from "./GameController";
import {VNode} from "preact";
import {ImportedGameData} from "../game/gdtypes";
import {LogLevel} from "./logging/Logger";
import {LogManager} from "./logging/LogManager";
import {Random} from "./math/Random";
import {XorWowRandom} from "./math/XorWowRandom";
import {GameData} from "./res/GameData";

const logger = LogManager.loggerFor("engine.Game");

export class Game {
	static instance: Game;

	info: GameInfo;
	idata: ImportedGameData;

	// Managers
	screenManager: ScreenManager;
	state: StateManager;
	saveManager: SaveManager;
	resourceManager: ResourceManager;

	// Controllers and globals
	gameController: GameController;
	rng: Random = XorWowRandom.create();

	// Resources
	data: GameData = new GameData();

	constructor(
		options: GameOptions
	) {
		if (Game.instance) throw new Error("Duplicate Game.instance");
		if (options.logLevel !== undefined) {
			LogManager.instance.defaultLevel = options.logLevel;
		}
		if (options.logLevels) {
			for (let [k, v] of Object.entries(options.logLevels)) {
				LogManager.instance.setLevel(k, v);
			}
		}
		logger.info("Game created");
		Game.instance = this;
		(window as any)["game"] = this;
		this.info = options.info;
		this.screenManager = new ScreenManager(document.querySelector(options.screenContainer));
		this.state = new StateManager();
		this.saveManager = new SaveManager();
		this.resourceManager = new ResourceManager(this, {
			loadGameData: options.data
		});
		this.gameController = new GameController(this);
	}

	async applicationStart() {
		await this.resourceManager.loadEssentialResources();
		await this.screenManager.replaceTop(new MainMenuScreen(), 'fade');
	}
}

export interface GameOptions {
	screenContainer: string;
	logLevel?: LogLevel;
	logLevels?: Record<string, LogLevel>;
	info: GameInfo;
	data: () => Promise<ImportedGameData>;
}

export interface GameInfo {
	title: string;
	subtitle: string | VNode;
	version: string;
}

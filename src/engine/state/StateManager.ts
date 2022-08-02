/*
 * Created by aimozg on 03.07.2022.
 */
import {PlayerCharacter} from "../objects/creature/PlayerCharacter";
import {LogManager} from "../logging/LogManager";
import {GameContext, NullGameContext} from "./GameContext";

const logger = LogManager.loggerFor("engine.state.StateManager");

/**
 * Global state holder and manager.
 * Performs conversion to/from JSON but doesn't write it into storage (that's SaveManager)
 */
export class StateManager {

	constructor() {}

	///////////////
	// Properties
	///////////////

	private _player: PlayerCharacter;
	get player(): PlayerCharacter { return this._player; }
	private _gcStack: GameContext[];

	//////////////////
	// Mass managers
	//////////////////

	clearGameState() {
		logger.info("clearGameState");
		this._player = new PlayerCharacter();
		this._gcStack = [new NullGameContext()];
	}

	importGameState(data: object) {
		logger.info("importGameState");
		this.clearGameState();
		// TODO importGameState
		throw new Error("Not implemented");
	}

	exportGameState(): object {
		logger.info("exportGameState");
		let save: object = {};
		return save;
	}

	///////////////////////
	// Granular accessors
	///////////////////////

	/**
	 * Set player. To be called during new game start only!
	 */
	setupPlayer(player: PlayerCharacter) {
		logger.debug("setupPlayer");
		this._player = player;
	}

	pushGameContext(context: GameContext) {
		logger.info("pushGameContext {}", context);
		this._gcStack.push(context);
	}

	flushGameContext(): GameContext {
		logger.debug("flushGameContext");
		while (true) {
			let top = this._gcStack[this._gcStack.length-1];
			if (top.ended) {
				logger.debug("game context ended {}", top);
				this._gcStack.pop();
			} else {
				return top;
			}
		}
	}
}

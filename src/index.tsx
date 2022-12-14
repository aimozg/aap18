/*
 * Created by aimozg on 03.07.2022.
 */

import {runGame} from "./engine/main";

import "./game/style/index.scss";
import {Fragment, h} from "preact";
import {loadGameData} from "./game/gamedata";
import {LogLevel} from "./engine/logging/Logger";


runGame({
	screenContainer: "#root",
	logLevel: LogLevel.DEBUG,
	logLevels: {
		// "engine.text.parser.AbstractParser": LogLevel.TRACE,
		// "game.ui.CreaturePanel": LogLevel.TRACE,
		"engine.combat.CombatRoll": LogLevel.TRACE
	},
	info: {
		title: "Aimozg's Abandoned Project No. 18",
		subtitle: <Fragment>
			A <a href="https://github.com/Ormael13/CoCX" target="_blank">CoCX</a> inspired game.
		</Fragment>,
		version: "v"+PACKAGE_VERSION
	},
	data: loadGameData
});

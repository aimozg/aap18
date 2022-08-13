/*
 * Created by aimozg on 03.07.2022.
 */
import "./style/index.scss";
import {Game, GameOptions} from "./Game";

async function main(options: GameOptions) {
	let game = new Game(options);
	await game.applicationStart();
}

export function runGame(options:GameOptions) {
	if (document.readyState === "complete") {
		main(options).then();
	} else {
		document.addEventListener("readystatechange",()=>{
			if (document.readyState === "complete") {
				main(options).then();
			}
		});
	}
}


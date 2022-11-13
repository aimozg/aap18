/*
 * Created by aimozg on 20.10.2022.
 */

import {GameDataBuilder} from "../GameDataBuilder";

export function gdRegisterTiles(gd:GameDataBuilder) {
	gd.addTiles([{
		ch: '#',
		id: '/wall',
		name: 'wall',
		fg: "#cccccc",
		bg: "#999999",
		solid: true
	}, {
		ch: '%',
		id: '/rubble',
		name: 'rubble',
		fg: "#cccccc",
		walkable: false
	}])
}

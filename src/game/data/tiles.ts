/*
 * Created by aimozg on 20.10.2022.
 */

import {GameDataBuilder} from "../GameDataBuilder";

export function gdRegisterTiles(gd:GameDataBuilder) {
	gd.addTiles([{
		id: '#',
		name: 'wall',
		solid: true
	}, {
		id: '.',
		name: 'floor'
	}])
}

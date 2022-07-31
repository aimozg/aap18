/*
 * Created by aimozg on 05.07.2022.
 */
import {GDColor} from "../gdtypes";

export function gdColors():GDColor[] {
	const skinColors:GDColor[] = [{
		name: "pale",
		rgb: '#f2e8e3',
		palette: "skin"
	}];
	const hairColors:GDColor[] = [{
		name: "brown",
		rgb: '#674f42',
		palette: "hair"
	}];
	const eyeColors:GDColor[] = [{
		name: "pale",
		rgb: '#f2e8e3',
		palette: "eye"
	}];
	const commonColors:GDColor[] = [{
		name: "pale",
		rgb: '#f2e8e3',
		palette: "common"
	}];

	return [...skinColors, ...hairColors, ...eyeColors, ...commonColors];
}

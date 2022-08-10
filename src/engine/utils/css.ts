/*
 * Created by aimozg on 10.08.2022.
 */
import {coerce} from "../math/utils";

export function stripedBackground(
	color1: string,
	color2: string,
	position: number = 0.5,
	angle: number = 90
): string {
	position = coerce(position,0,1)*100;
	return 'linear-gradient(' +
		angle +'deg, '+
		color1+' '+position+'%, ' +
		color2+' '+position+'%)'
}

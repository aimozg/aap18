/*
 * Created by aimozg on 04.07.2022.
 */
import {LogManager} from "../../logging/LogManager";
import {AbstractParser} from "./AbstractParser";
import {Parsed} from "./Parsed";
import {TextOutput} from "../output/TextOutput";
import {VNode} from "preact";
import {Creature} from "../../objects/Creature";
import {Game} from "../../Game";
import fxrng from "../../math/fxrng";
import {Character} from "../../objects/creature/Character";

const logger = LogManager.loggerFor("engine.text.Parser")

export class Parser extends AbstractParser {
	constructor(public self: Creature = Game.instance.state.player) {
		super();
	}

	target: Creature = Game.instance.state.player;
	private stack: Creature[] = [];

	setTarget(creature: Creature) {
		this.target = creature
	}

	selectActor(creature: Creature) {
		this.stack.push(this.target);
		this.setTarget(creature);
	}

	deselectActor() {
		this.setTarget(this.stack.pop() ?? this.self);
	}

	print(text: string): VNode {
		return TextOutput.render(this.parse(text))
	}

	protected doEvaluateTag(tag: string, tagArgs: string): Parsed | string {
		logger.trace("doEvaluateTag {} {}", tag, tagArgs)
		let isSelf = this.self && (this.self === this.target);
		let target = this.target;
		switch (tag) {
			case 'either':
			case 'either:':
				return fxrng.pick(tagArgs.split('|'));
			case 'you':
				return isSelf ? 'you' : target.name;
			case 'your':
				return isSelf ? 'your' : (target.name + "'s"); // TODO plural +"'"
			case 'have':
			case 'has':
				return isSelf ? 'have' : 'has'; // TODO check target.isPlural
			case 'is':
			case 'are':
				return isSelf ? 'are' : 'is'; // TODO check target.isPlural
			case 'foot':
				if (!(target instanceof Character)) return "foot";
				return target.body.legs.foot();
			case 'feet':
				if (!(target instanceof Character)) return "feet";
				return target.body.legs.feet();
			case 'pg':
				return {
					type: "group",
					content: [{type: "br"}, {type: "br"}]
				}
			default:
				throw new Error("Unknown tag " + tag);
		}
	}

}

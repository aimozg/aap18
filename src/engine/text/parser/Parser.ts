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
	static AllowedHtmlTags: string[] = ["hl"];

	constructor(public self: Creature = Game.instance.state.player) {
		super();
		for (let tag of Parser.AllowedHtmlTags) this.allowedHtmlTags.add(tag);
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
		let targetch = (this.target instanceof Character) ? this.target : null;
		// TODO move these into tag library
		switch (tag) {
			case 'either':
			case 'either:':
				// [either:option1|option2|option3]
				return fxrng.pick(tagArgs.split('|'));
			//----------------//
			// Text utilities //
			//----------------//
			case 'pg':
				return {
					type: "group",
					content: [{type: "br"}, {type: "br"}]
				}
			//------------------//
			// Phrasing helpers //
			//------------------//
			case 'have':
			case 'has':
				return isSelf ? 'have' : 'has'; // TODO check target.isPlural
			case 'is':
			case 'are':
				return isSelf ? 'are' : 'is'; // TODO check target.isPlural
			//-----------------------//
			// Pronouns and identity //
			//-----------------------//
			case 'you':
				return isSelf ? 'you' : target.name;
			case 'your':
				return isSelf ? 'your' : (target.name + "'s"); // TODO plural +"'"
			case 'he':
			case 'she':
			case 'they':
				return target.pronouns.they;
			case 'his':
			case 'her':
			case 'their':
				return target.pronouns.their;
			case 'hers':
			case 'theirs':
				return target.pronouns.theirs;
			case 'him':
			case 'them':
				return target.pronouns.them;
			case 'himself':
			case 'herself':
			case 'themselves':
				return target.pronouns.themselves;
			case 'foot':
				if (!(target instanceof Character)) return "foot";
				return target.body.legs.foot();
			case 'feet':
				if (!(target instanceof Character)) return "feet";
				return target.body.legs.feet();
			case 'mf:': {
				// [mf:masculine|feminine]
				let [m, f] = tagArgs.split('|');
				return target.mf(m, f)
			}
			case 'mfx:': {
				// [mf:masculine|feminine|other]
				let [m, f, x] = tagArgs.split('|');
				return target.mfx(m, f, x)
			}
			//------//
			// Body //
			//------//
			case 'skincolor':
				return targetch?.body?.skinColors ?? '<text-error>target is not a Character</text-error>'
			//----------------//
			default:
				throw new Error("Unknown tag " + tag);
		}
	}

}

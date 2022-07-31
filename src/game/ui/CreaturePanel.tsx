import {DomComponent} from "../../engine/ui/DomComponent";
import {h} from "preact";
import {Creature} from "../../engine/objects/Creature";
import {Fragment, render} from "preact/compat";
import {Bar} from "../../engine/ui/components/Bar";
import {removeChildren} from "../../engine/utils/dom";
import {coerce} from "../../engine/math/utils";
import {PlayerCharacter} from "../../engine/objects/creature/PlayerCharacter";

export interface CreaturePanelOptions {
	ap: boolean;

	level: boolean;
	sex: boolean;
	race: boolean;

	xp: boolean;

	resources: boolean;
	hp: boolean;
	lp: boolean;
	ep: boolean;

	attributes: boolean;

	combatStats: boolean;

	otherStats: boolean;

	equipment: boolean;
}

export class CreaturePanel extends DomComponent {
	constructor(options:Partial<CreaturePanelOptions> = {}) {
		super(<div class="creature-panel"></div>);
		this.options = Object.assign({}, CreaturePanel.DefaultOptions, options);
	}
	options: CreaturePanelOptions;
	static DefaultOptions: CreaturePanelOptions = {
		ap: true,

		level: true,
		sex: true,
		race: true,
		xp: true,

		resources: true,
		hp: true,
		lp: true,
		ep: true,

		attributes: true,

		combatStats: true,

		otherStats: true,

		equipment: true
	}
	update(c: Creature | null) {
		if (!c) {
			removeChildren(this.node);
			return;
		}
		let options = this.options;

		//-------------------//
		// Name and AP as bg //
		//-------------------//
		let apPercent = coerce(100 * c.ap / 1000, 0, 100);
		let sectionName = <div className="text-center text-l" style={{
			'background': 'linear-gradient(90deg,' +
				' var(--theme-ctrl-bg) ' + apPercent + '%,' +
				' transparent ' + apPercent + '%)'
		}}>{c.name.capitalize()}</div>
		//------------------//
		// Level, sex, race //
		//------------------//
		let sectionTitle = (options.level || options.sex || options.race) ? <div className="text-center text-s">
			{options.level && ('Level ' + c.level)}
			{' '}{options.sex && c.txt.sex}
			{' '}{options.race && c.txt.race}
		</div> : null;
		//--------//
		// XP bar //
		//--------//
		let sectionXp;
		if (c instanceof PlayerCharacter) {
			let xp = c.xp;
			let xpmax = c.nextLevelXp();
			if (!isFinite(xpmax)) {
				xp = xpmax = 100;
			}
			sectionXp = <Bar value={xp} max={xpmax} className="bar-xp"></Bar>
		} else {
			sectionXp = null
		}
		//-----------//
		// Resources //
		//-----------//
		/*TODO hide bars if creature have no such resource*/
		let sectionResources = options.resources && <div
			style="display: grid; grid-template-columns: max-content auto; gap: 4px; align-items: baseline"
			className="mt-4 mb-1">
			<div>Health</div>
			<Bar value={c.hp} max={c.hpMax} className="bar-hp">{options.hp && Math.round(c.hp)}</Bar>
			<div>Lust</div>
			<Bar value={c.lp} max={c.lpMax} className="bar-lp">{options.lp && Math.round(c.lp)}</Bar>
			<div>Energy</div>
			<Bar value={c.ep} max={c.epMax} className="bar-ep">{options.ep && Math.round(c.ep)}</Bar>
		</div>
		//------------//
		// Attributes //
		//------------//
		let sectionAttributes = options.attributes && <div className="grid-8 text-center my-2">
			<div className="text-s">STR</div>
			<div className="text-s">DEX</div>
			<div className="text-s">CON</div>
			<div className="text-s">PER</div>
			<div className="text-s">INT</div>
			<div className="text-s">WIS</div>
			<div className="text-s">CHA</div>
			<div className="text-s">MAF</div>
			<div>{c.str}</div>
			<div>{c.dex}</div>
			<div>{c.con}</div>
			<div>{c.per}</div>
			<div>{c.int}</div>
			<div>{c.wis}</div>
			<div>{c.cha}</div>
			<div>{c.maf}</div>
		</div>
		//--------------//
		// Combat stats //
		//--------------//
		let sectionCombatStats = options.combatStats && <div className="grid-8 text-center my-2">
			<div className="text-s">For</div>
			<div className="text-s">Ref</div>
			<div className="text-s">Wil</div>
			<div className="text-s"></div>
			<div className="text-s">Atk</div>
			<div className="text-s">Def</div>
			<div className="text-s">DR</div>
			<div className="text-s"></div>
			<div>{c.fortitude}</div>
			<div>{c.reflex}</div>
			<div>{c.will}</div>
			<div></div>
			<div>{c.attack}</div>
			<div>{c.defense}</div>
			<div>{c.dr}</div>
			<div></div>
		</div>
		//-------------//
		// Other stats //
		//-------------//
		let sectionOtherStats = options.otherStats && <div className="grid-4 text-center my-2">
			<div className="text-s">Libido</div>
			<div className="text-s">Perversion</div>
			<div className="text-s">Corruption</div>
			<div className="text-s"></div>
			<div>{c.lib}</div>
			<div>{c.perv}</div>
			<div>{c.cor}</div>
			<div></div>
		</div>
		//-----------//
		// Equipment //
		//-----------//
		let sectionEquipment = options.equipment && <div className="grid-4 my-2">
			<div>Weapon:</div>
			<div className="col-span-2 text-center">{c.weapon?.name ?? "(none)"}</div>
			<div className="text-center">{c.weapon?.baseDamage?.toString() ?? ""}</div>
		</div>
		render(<Fragment>
			{sectionName}
			{sectionTitle}
			{sectionXp}
			{sectionResources}
			{sectionAttributes}
			{sectionCombatStats}
			{sectionOtherStats}
			{sectionEquipment}
		</Fragment>, this.node)
	}
}

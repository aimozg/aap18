import {DomComponent} from "../../engine/ui/DomComponent";
import {ComponentChildren, h, VNode} from "preact";
import {Creature} from "../../engine/objects/Creature";
import {Fragment, render} from "preact/compat";
import {Bar} from "../../engine/ui/components/Bar";
import {removeChildren} from "../../engine/utils/dom";
import {stripedBackground} from "../../engine/utils/css";
import {CommonText} from "../../engine/text/CommonText";
import {PartialRecord} from "../../engine/utils/types";
import {LogManager} from "../../engine/logging/LogManager";
import {Button} from "../../engine/ui/components/Button";
import {CombatRules} from "../combat/CombatRules";

export interface CreaturePanelOptions {
	collapsible: boolean;

	ap: boolean;

	level: boolean;
	sex: boolean;
	race: boolean;

	xp: boolean;

	resources: boolean;
	hp: boolean;
	lp: boolean;
	ep: boolean;

	conditions: boolean;

	attributes: boolean;

	combatStats: boolean;

	otherStats: boolean;

	equipment: boolean;

	money:boolean;
}
type CreatureValueDef = (c:Creature)=>number
export type CreatureValueId = 'ap'|'xp'|'hp'|'ep'|'lp'|'money';
const CreatureValueDefs: Record<CreatureValueId,CreatureValueDef> = {
	ap: (c=>c.ap),
	xp: (c=>c.xp),
	hp: (c=>c.hp),
	ep: (c=>c.ep),
	lp: (c=>c.lp),
	money: (c=>c.money),
}
interface CreatureValueAnimation {
	x: number;
	x2: number;
	v: number;
}
export class CreaturePanel extends DomComponent {
	constructor(
		creature: Creature|null,
		options:Partial<CreaturePanelOptions> = {}) {
		super(<div class="creature-panel"></div>);
		this._creature = creature;
		this.options = Object.assign({}, CreaturePanel.DefaultOptions, options);
	}
	private _creature:Creature|null;
	get creature(): Creature|null {
		return this._creature;
	}

	set creature(value: Creature | null) {
		this._creature = value;
		this.animatedValues = {};
		this.update()
	}

	private _collapsed: boolean = false;
	get collapsed():boolean { return this._collapsed }
	set collapsed(value: boolean) {
		if (value) {
			this.collapse();
		} else {
			this.expand();
		}
	}
	collapse() {
		if (this._collapsed) return;
		this._collapsed = true;
		this.update();
	}
	expand() {
		if (!this._collapsed) return;
		this._collapsed = false;
		this.update();
	}

	options: CreaturePanelOptions;
	static DefaultOptions: CreaturePanelOptions = {
		collapsible: true,

		ap: true,

		level: true,
		sex: true,
		race: true,
		xp: true,

		resources: true,
		hp: true,
		lp: true,
		ep: true,

		conditions: true,

		attributes: true,

		combatStats: true,

		otherStats: true,

		equipment: true,

		money: true,
	}
	animatedValues:PartialRecord<CreatureValueId, CreatureValueAnimation> = {}
	value(id:CreatureValueId):number {
		if (!this.creature) return 0;
		return this.animatedValues[id]?.x ?? CreatureValueDefs[id](this.creature);
	}
	animateValue(valueId:CreatureValueId, newValue:number, durationMs:number) {
		if (!this.creature) return;
		let oldValue = CreatureValueDefs[valueId](this.creature);
		if (oldValue === newValue) {
			delete this.animatedValues[valueId];
			return
		}
		let v = (newValue-oldValue)/durationMs;
		logger.debug("animating {} {} -> {} (v={})", valueId, oldValue, newValue, v)
		this.animatedValues[valueId] = {
			x: oldValue,
			x2: newValue,
			v: v
		}
	}
	animationFrame(dt:number) {
		let animatedValues = Object.entries(this.animatedValues);
		if (animatedValues.length === 0) return;
		for (let [k,v] of animatedValues) {
			v.x += v.v*dt;
			logger.trace("animated {} x={} v={} dt={}",k,v.x,v.v,dt);
			if (v.v > 0 && v.x >= v.x2 || v.v < 0 && v.x <= v.x2) {
				delete this.animatedValues[k as CreatureValueId];
				logger.debug("value {} animation to {} finished",k,v.x2);
			}
		}
		this.update();
	}
	/** Name with AP as bg */
	private sectionName(): ComponentChildren {
		let c = this.creature!;
		return <div className="text-center text-l" style={{
			'background': stripedBackground('var(--theme-ctrl-bg)', 'transparent', this.value("ap") / 1000)
		}}>{c.name.capitalize()}</div>;
	}
	/** XP bar */
	private sectionXp(): ComponentChildren {
		if (!this.options.xp) return null;
		let c = this.creature!;
		let xp = this.value('xp');
		let xpmax = c.nextLevelXp();
		let className = "bar-xp"
		if (!isFinite(xpmax)) {
			xp = xpmax = 100;
			className += " -cap";
		} else if (xp >= xpmax) {
			className += " -up"
		}
		return <Bar value={xp} max={xpmax} className={className}></Bar>
	}
	/** Level, sex, race */
	private sectionSubtitle(): ComponentChildren {
		let options = this.options;
		let c = this.creature!;
		return (options.level || options.sex || options.race) ? <div className="text-center text-s">
			{options.level && ('Level ' + c.level)}
			{' '}{options.sex && c.txt.sex}
			{' '}{options.race && c.txt.race}
		</div> : null
	}
	/** Resources */
	private sectionResources(): ComponentChildren {
		let options = this.options;
		let c = this.creature!;
		/*TODO hide bars if creature have no such resource*/
		return options.resources && <div
            style="display: grid; grid-template-columns: max-content auto; gap: 4px; align-items: baseline"
            className="mt-4 mb-1">
            <div>Health</div>
            <Bar value={this.value('hp')} max={c.hpMax} className="bar-hp" print={options.hp}/>
            <div>Lust</div>
            <Bar value={this.value("lp")} max={c.lpMax} className="bar-lp" print={options.lp}/>
            <div>Energy</div>
            <Bar value={this.value("ep")} max={c.epMax} className="bar-ep" print={options.ep}/>
        </div>
	}
	/** Attributes */
	private sectionAttributes():ComponentChildren {
		let c = this.creature!;
		return this.options.attributes && <div className="grid-8 text-center my-2">
            <div className="text-s">STR</div>
            <div className="text-s">DEX</div>
            <div className="text-s">CON</div>
            <div className="text-s">SPE</div>
            <div className="text-s">PER</div>
            <div className="text-s">INT</div>
            <div className="text-s">WIS</div>
            <div className="text-s">CHA</div>
            <div>{c.str}</div>
            <div>{c.dex}</div>
            <div>{c.con}</div>
            <div>{c.spe}</div>
            <div>{c.per}</div>
            <div>{c.int}</div>
            <div>{c.wis}</div>
            <div>{c.cha}</div>
        </div>
	}
	/** Combat stats - saving throws, attack, defense, DR */
	private sectionCombatStats():ComponentChildren {
		let c = this.creature!;
		let options = this.options;
		return options.combatStats && <div className="grid-8 text-center my-2">
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
            <div>{c.willpower}</div>
            <div></div>
            <div>{CombatRules.meleeAttack(c)}</div>
            <div>{CombatRules.meleeDefense(c)}</div>
            <div>{c.dmgRedAll}</div>
            <div></div>
        </div>
	}
	/** Libido, perversion, corruption */
	private sectionSecondaryStats():ComponentChildren {
		let c = this.creature!;
		return this.options.otherStats && <div className="grid-4 text-center my-2">
            <div className="text-s">Libido</div>
            <div className="text-s">Perversion</div>
            <div className="text-s">Corruption</div>
            <div className="text-s"></div>
            <div>{c.lib}</div>
            <div>{c.perv}</div>
            <div>{c.cor}</div>
            <div></div>
        </div>;
	}
	private sectionEquipment():ComponentChildren {
		let c = this.creature!;
		return this.options.equipment && <div className="grid-4 my-2">
            <div className="text-right">Weapon:</div>
            <div className="cols-2 text-center">{c.currentWeapon.name}</div>
            <div className="text-center">{CommonText.weaponInfo(c.currentWeapon)}</div>
            <div className="text-right">Armor:</div>
            <div className="cols-2 text-center">{c.bodyArmor?.name ?? "-"}</div>
            <div className="text-center">{CommonText.armorInfo(c.bodyArmor)}</div>
        </div>;
	}

	private sectionMisc():ComponentChildren {
		let options = this.options;
		return <div className="grid-4 my-2">
			{options.money && <Fragment>
                <div className="text-right">Money:</div>
                <div className="text-right text-money cols-2">{this.value('money').format(",d")}</div>
                <div></div>
            </Fragment>}
		</div>
	}
	private renderExpanded(): VNode {
		return <Fragment>
			{this.sectionName()}
			{this.sectionSubtitle()}
			{this.sectionXp()}
			{this.sectionResources()}
			{this.sectionAttributes()}
			{this.sectionCombatStats()}
			{this.sectionSecondaryStats()}
			{this.sectionEquipment()}
			{this.sectionMisc()}
			{this.options.collapsible && <Button className="-flat -bottom-collapser text-center" onClick={() => this.collapse()}>▴</Button>}
		</Fragment>
	}

	/** Name and level with AP as bg */
	private sectionNameCompact(): ComponentChildren {
		let c = this.creature!;
		return <div style={{
			'background': stripedBackground('var(--theme-ctrl-bg)', 'transparent', this.value("ap") / 1000)
		}} class="d-flex jc-space-between ai-baseline px-2">
			<span className="text-l">{c.name.capitalize()}</span>
			{this.options.level && <span className="text-s">Lv {c.level}</span>}
		</div>
	}

	/** Resources (compact) */
	private sectionResourcesCompact():ComponentChildren {
		let options = this.options;
		let c = this.creature!;
		return options.resources && <div class="d-grid grid-3 gap-1 my-1">
            <Bar value={this.value('hp')} max={c.hpMax} className="bar-hp" print={options.hp}/>
            <Bar value={this.value("lp")} max={c.lpMax} className="bar-lp" print={options.lp}/>
            <Bar value={this.value("ep")} max={c.epMax} className="bar-ep" print={options.ep}/>
        </div>
	}

	private sectionStatusCompact():ComponentChildren {
		let c = this.creature!;
		// TODO tooltips
		return this.options.conditions && <Fragment>
			{[...c.conditions].map(cc=>
				<div class="condition-icon" style={{
					color: cc.icon.fg,
					background: cc.icon.bg
				}}>{cc.icon.text}</div>
			)}
		</Fragment>
	}

	private renderCollapsed(): VNode {
		return <Fragment>
			{this.sectionNameCompact()}
			{this.sectionXp()}
			{this.sectionResourcesCompact()}
			<div class="d-flex flex-wrap gap-2">
				{this.sectionStatusCompact()}
				<div class="flex-grow-1"></div>
				{this.options.collapsible && <Button className="-icon -flat" onClick={() => this.expand()}>▾</Button>}
			</div>
		</Fragment>
	}

	update() {
		if (!this.creature) {
			removeChildren(this.node);
			return;
		}
		this.node.classList.toggle("-dead", !this.creature.isAlive);
		this.node.classList.toggle("-collapsed", this.collapsed);
		this.node.classList.toggle("-collapsible", this.options.collapsible);
		render(
			this.collapsed ? this.renderCollapsed() : this.renderExpanded(),
			this.node
		)
	}
}

const logger = LogManager.loggerFor("game.ui.CreaturePanel");

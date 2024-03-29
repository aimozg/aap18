import {Component, ComponentChildren, h, VNode} from "preact";
import {Creature} from "../../objects/Creature";
import {Fragment} from "preact/compat";
import {Bar} from "../components/Bar";
import {stripedBackground} from "../../utils/css";
import {CommonText} from "../../text/CommonText";
import {PartialRecord} from "../../utils/types";
import {LogManager} from "../../logging/LogManager";
import {Button} from "../components/Button";
import {CombatRules} from "../../../game/combat/CombatRules";
import {TextIcon} from "../../objects/creature/CreatureCondition";
import {signClass} from "../../utils/math";
import {TAttribute, TAttributes} from "../../rules/TAttribute";
import {WithTooltip} from "../components/WithTooltip";

export interface CreaturePanelOptions {
	cssclass: string;
	collapsible: boolean;
	collapsed: boolean;

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
interface ConditionOrEffect {
	icon: TextIcon;
	name: string;
	description: string;
}
export interface CreaturePanelProps {
	creature:Creature|null,
	options?:Partial<CreaturePanelOptions>
}
export class CreaturePanel extends Component<CreaturePanelProps, any> {
	constructor(props:CreaturePanelProps) {
		super();
		this.options = Object.assign({}, CreaturePanel.DefaultOptions, props.options);
		this._collapsed = this.options.collapsed;
	}
	get creature(): Creature|null {
		return this.props.creature;
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
		collapsed: false,
		cssclass: "",

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
			{TAttributes.map(attr=>
				<div class="text-s">{TAttribute[attr]}</div>
			)}
			{TAttributes.map(attr=>
				<div class={signClass(c.attrBuffable(attr).value)}>{c.attr(attr)}</div>
			)}
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
	private conditionsAndStatusEffects():ConditionOrEffect[] {
		let c = this.creature!;
		return [
			...c.conditions,
			...c.statusEffects.values()
		]
	}
	/** Status effects */
	private sectionStatus():ComponentChildren {
		// TODO tooltips
		return this.options.conditions && <div class="my-2">
			{this.conditionsAndStatusEffects().map(cc=>
				<WithTooltip tooltip={cc.description}>
					<div class="creature-status-effect" style={{
						color: cc.icon.fg,
						background: cc.icon.bg
					}}>{cc.name}</div>
				</WithTooltip>
			)}
        </div>
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
	/** Money (what else?) */
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
			{this.sectionStatus()}
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
		return this.options.conditions && <Fragment>
			{this.conditionsAndStatusEffects().map(cc=>
				<WithTooltip tooltip={
					<Fragment>
						<div class="text-bold my-2">{cc.name}</div>
						{cc.description}
					</Fragment>
				}>
					<div class="status-effect-icon"
						 style={{
						color: cc.icon.fg,
						background: cc.icon.bg
					}}>{cc.icon.text}</div>
				</WithTooltip>
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
		this.forceUpdate();
	}
	render(): ComponentChildren {
		let creature = this.creature;
		if (!creature) return <div></div>
		let className = "creature-panel";
		if (this.options.cssclass) className += " "+this.options.cssclass;
		if (!creature.isAlive) className += " -dead";
		if (this.collapsed) className += " -collapsed";
		if (this.options.collapsible) className += " -collapsible";
		return <div className={className}>{this.collapsed ? this.renderCollapsed() : this.renderExpanded()}</div>
	}
}

const logger = LogManager.loggerFor("game.ui.CreaturePanel");

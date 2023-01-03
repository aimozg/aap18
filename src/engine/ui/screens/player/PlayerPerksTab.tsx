import {AbstractPlayerScreenTab} from "./AbstractPlayerScreenTab";
import {Fragment, h, VNode} from "preact";
import {PerkType} from "../../../rules/PerkType";
import {Button} from "../../components/Button";
import {ButtonMenu} from "../../components/ButtonMenu";
import {Radio} from "../../components/Radio";
import {numberOfThingsStyled} from "../../../text/utils";

enum PerkFilter {
	OWNED,
	NOT_OWNED,
}

export class PlayerPerksTab extends AbstractPlayerScreenTab {
	get label() {
		return <div class="d-ib text-nowrap">
			Perks{this.interactive && this.player.perkPoints > 0 &&
            <span class="text-focus-blink text-elevated">(+{this.player.perkPoints})</span>}
		</div>
	}

	selectedPerk:PerkType|null = null;
	perkFilter:PerkFilter = PerkFilter.OWNED;

	selectPerk(perk:PerkType) {
		this.selectedPerk = perk;
		this.screen.render();
	}

	takePerk() {
		let perk = this.selectedPerk!;
		this.selectedPerk = null;
		this.screen.takePerk(perk);
	}

	setFilter(pf:PerkFilter) {
		this.perkFilter = pf;
		this.selectedPerk = null;
		this.screen.render();
	}

	node(): VNode {
		let perks: PerkType[];
		switch (this.perkFilter) {
			case PerkFilter.OWNED:
				perks = this.player.perkList();
				break;
			case PerkFilter.NOT_OWNED:
				perks = this.player.ctrl.futurePerks();
				break;
			default:
				perks = [];
		}
		return <div>
			<h3>Perks</h3>
			<p>
				You have {numberOfThingsStyled("text-hl", "", this.player.perkPoints, "perk point")}.
			</p>
			<div className="grid-12 gap-2 my-4">
				<div className="cols-6">
					<h4>List
						<Radio name="perkFilter"
						       variable={this.perkFilter}
						       value={PerkFilter.OWNED}
						       onChange={this.setFilter.bind(this)}>owned</Radio>
						<Radio name="perkFilter"
						       variable={this.perkFilter}
						       value={PerkFilter.NOT_OWNED}
						       onChange={this.setFilter.bind(this)}>not owned</Radio>
					</h4>
					<ButtonMenu items={perks.map(perk=>({
						label: perk.name,
						value: perk,
						className: "-big -link w100"+(!this.player.hasPerk(perk) && !perk.obtainableBy(this.player) ? " link-bad" : "")
					}))}
					            selected={this.selectedPerk}
					            onChange={p=>this.selectPerk(p)}/>
				</div>
				<div className="cols-6">
					<h4>Description</h4>
					{this.selectedPerk && <Fragment>
						{this.selectedPerk.description(this.player)}
						{this.selectedPerk.requirements.length > 0 && <h4>Requirements</h4>}
						{this.selectedPerk.requirements.map(r=>
							<div class={this.player.hasPerk(this.selectedPerk!) ? "" :
								r.test(this.player) ? "text-positive" : "text-negative"}>
								{r.name}
						</div>)}
						{!this.player.hasPerk(this.selectedPerk) &&
							<Button className="-big mt-4"
						         onClick={() => this.takePerk()}
						         disabled={!this.screen.canTakePerk(this.selectedPerk)}
						         label="Take"/>}
                    </Fragment>}
				</div>
			</div>

		</div>
	}
}

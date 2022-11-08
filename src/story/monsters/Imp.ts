import {Character} from "../../engine/objects/creature/Character";
import {RacialGroups} from "../../game/data/racialGroups";
import {Game} from "../../engine/Game";
import {TinyFireBolt} from "./abilities/TinyFireBolt";

export class Imp extends Character {
    constructor() {
        super();

        this.rgroup = RacialGroups.DEMON;
        this.name = "imp";

        this.level = 1;
        this.naturalAttrs = [
            4, 5, 4, 6,
            5, 3, 3, 3
        ];
        this.baseHpPerLevel = 5;
        this.baseEpPerLevel = 5;
        this.baseLpMax = 25;

        this.body.eyes.color = Game.instance.data.colorByName("red", "eyes");
        this.setSex('m');
        // TODO set imp body parts

        this.abilities.push(TinyFireBolt);

        this.money = this.rng.nextInt(5, 15);

        this.updateStats();
    }
}
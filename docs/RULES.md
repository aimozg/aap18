# Abbreviations

* **AP** - Action points
* **Atk** - Attack combat stat
* **CHA**, **CHAmod** - Charisma attribute and modifier
* **CON**, **CONmod** - Constitution attribute and modifier
* **Corr** - Corruption secondary stat
* **Def** - Defense comnad stat
* **DEX**, **DEXmod** - Dexterity attribute and modifier
* **DR** - Damage reduction
* **EP** - Energy points
* **HP** - Hit points
* **INT**, **INTmod** - Intelligence attribute and modifier
* **Lib** - Libido secondary stat
* **LP** - Lust points
* **PER**, **PERmod** - Perception attribute and modifier
* **Perv** - Perversion secondary stat
* **SPE**, **SPEmod** - Speed attribute and modifier
* **STR**, **STRmod** - Strength attribute and modifier
* **WIS**, **WISmod** - Wisdom attribute and modifier

# Creature stats

## Resources

* **Hit points (HP)**. When reaches zero, creature is incapacitated.
* **Max HP**. Base value is `(10 + CONmod) * level`.
* **Energy points (EP)**. Used for abilities.
* **Max EP**. Base value is `(10 + CONmod) * level`.
* **Lust points (LP)**. When reaches maximum, creature is suspectible to seduction defeat.
* **Max LP**. Base value is 100.
* **Action points (AP)**. See combat section.

## Attributes

Attributes have an integer value of 1 or more. "Average" value is 5. Attribute modifier (labeled `XYZmod` for attribute `XYZ`) is attribute value minus 5.

* **Strength (STR)**. Increases melee damage (non-small weapons); melee attack bonus (huge weapons).
* **Dexterity (DEX)**. Increases defense; melee attack (medium and large weapons); melee damage (small weapons); reflex.
* **Constitution (CON)**. Increases max HP per level; max EP per level; fortitude.
* **Speed (SPE)**. Decreases AP cost of most actions. Increases melee attack (small weapons)
* **Perception (PER)**. Increases attack with ranged weapons.
* **Intelligence (INT)**.
* **Wisdom (WIS)**. Increases will.
* **Charisma (CHA)**.

## Secondary stats

## Combat stats

* **Attack (Atk)**. Increase chance to hit. Base values:
 - Small melee weapon: `SPEmod`
 - Medium or large melee weapon: `DEXmod`
 - Huge melee weapon: `STRmod`
 - Ranged weapon: `PERmod`
* **Defense (Def)**. Decreases chance to be hit. Base value is `5 + DEXmod`. Calculated differently in certain situations.
* **Damage reduction (DR)**. Subtracted from incoming damage. Damage-type dependent. Base value is zero.

## Skills

# Combat

## Time flow

Time is counted in rounds and ticks (1 round = 1000 ticks). Every tick each combatant is given 1 action point (AP). When a combatant reaches 1000 AP, they can act. They can perform any action, even the one that costs more than 1000 AP.

Most actions' AP cost is multiplied by speed-dependant factor:
* Movement actions: `x (10 / (5 + SPE))` or `x (10 / (10 + SPEmod))`
* Other actions: `x (20 / (15 + SPE))` or `x (20 / (20 + SPEmod))`

## Actions

### Movement

Base step AP cost = 500.

Moving out of the melee reach provokes an attack of opportunity.

#### Stealth movement

### Melee attack

Base melee attack AP cost = 1000.

### Tease

# Items

## Weapons

Weapon properties:
* Primary attack - damage dice and damage type (slashing/piercing/blunt).
* Secondary attack(s), optional.
* Size.
* Special properties.

To calculate attack damage dice: start with dice 1d10 (DDR 6, see table) and modify as follows:
* +1 DDR for two-handed attacks
* -1 DDR for each 2 dice ranks of secondary attack
* -2..+3 DDR depending on weapon size
* -1 DDR per special property

Damage dice ranks (DDR):

| Rank        | 1   | 2   | 3   | 4   | 5   | 6        | 7    | 8    | 9    | 10   | 11   |
|-------------|-----|-----|-----|-----|-----|----------|------|------|------|------|------|
| **Dice**    | 1d2 | 1d3 | 1d4 | 1d6 | 1d8 | **1d10** | 2d6  | 3d6  | 4d6  | 4d8  | 4d10 |
| **Range**   | 1-2 | 1-3 | 1-4 | 1-6 | 1-8 | **1-10** | 2-12 | 3-18 | 4-24 | 4-32 | 4-40 |
| **Average** | 1.5 | 2   | 2.5 | 3.5 | 4.5 | **5.5**  | 7    | 10.5 | 14   | 18   | 22   |

Weapon sizes:

| Size   | AP cost | DDR | Attack bonus | Damage bonus | Extra           |
|--------|---------|-----|--------------|--------------|-----------------|
| Small  | 80%     | -2  | SPE          | DEX          | One-handed only |
| Medium | 100%    | 0   | DEX          | STR          |                 |
| Large  | 150%    | +1  | DEX          | STR          |                 |
| Huge   | 200%    | +2  | STR          | STR          | Two-handed only |

Weapon specials (-1 DDR, if not specified otherwise):
* **Sneaky**: Eligible for sneak attacks
* **Momentum**: Gain speed to dmg when charging
* **Stunning**: Has a chance to stun opponents
* **Dueling**: +20% chance to base critical hit
* **Executioner**: 2x as much critical damage
* **Impaling**: Ignore 50% of opponent Armor
* **Reach**: Strikes from 1 extra square away
* **Caster**: Weapon adds a modifier to spellcasting as a foci.

### Examples

* Staff 
  - Medium size (100% AP cost, attack=DEX, damage=STR)
  - Primary attack: Bash, 1d10 blunt damage (2d6 if two-handed)
* Sword
  - Medium size (100% AP cost, attack=DEX, damage=STR)
  - Primary attack: Slash, 1d8 slashing (1d10 if two-handed)
  - Secondary attack: Stab, 1d3 piercing (1d4 if two-handed)
  - Primary attack damage:
    - Starting 6 (1d10)
    - Has rank 2 (1d3) secondary attack, so -1 (1d8)
* Dagger
  - Small size (80% AP cost, attack=SPE, damage=DEX, one-handed only)
  - Primary attack: Stab, 1d4 piercing
  - Special: Sneaky (can be used for sneak attacks)
  - Primary attack damage calculation:
      - Starting 6 (1d10)
      - Small size: -2 (1d6)
      - Sneaky: -1 (1d4)
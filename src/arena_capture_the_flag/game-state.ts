import { Creep, Id } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { ATTACK, RANGED_ATTACK, HEAL } from "game/constants";

// Starting with
// 6 ranges
// 6 healers
// 2 melees
//
// Sounds like 2 teams with melee would be good
//
// => 1 range, 1 healer defending (enable range attack), rest rushes in formations
// 2 teams with 1 range, 1 heal, 1 melee => good to push initially or to take over the flag
// 3 teams with 1 range, 1 heal
//
// OR
//
// => 1 range, 1 healer defending (enable range attack), rest rushes in formations
// 1 team with 1 heal, 2 melee => good to push initially or to take over the flag
// 1 teams with 2 range, 1 heal => support for melee squad
// 1 teams with 3 range, 2 heal => Flanker?

//
// export interface FlagSitterSquad {
//  ranged: Id<Creep>,
//  healer: Id<Creep>
// }
//
// export interface BalancedSquad {
//   melee: Id<Creep>,
//   ranged: Id<Creep>,
//   healer: Id<Creep>
// }
//
// export interface RangeSquad {
//   ranged: Id<Creep>,
//   healer: Id<Creep>
// }
//
export interface GameState {
  defenders: ReadonlyArray<Id<Creep>>;
}

let gameState: GameState;

export function initializeGameState() {
  const myCreeps = getObjectsByPrototype(Creep)
    .filter(c => c.my);
  const myAttackCreeps =  myCreeps.filter(c => c.body.some(b => b.type === ATTACK));
  // const myRangedCreeps =  myCreeps.filter(c => c.body.some(b => b.type === RANGED_ATTACK));
  // const myHealerCreeps =  myCreeps.filter(c => c.body.some(b => b.type === HEAL));

  gameState = {
    defenders: myAttackCreeps.map(c => c.id),
  };
}

export function getGameState(): GameState {
  return gameState;
}

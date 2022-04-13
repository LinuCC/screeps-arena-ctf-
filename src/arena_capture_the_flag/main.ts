// Note that there is no global objects like Game or Memory. All methods, prototypes and constants are imported built-in modules
// import {
//   ATTACK,
//   CostMatrix,
//   HEAL,
//   RANGED_ATTACK,
//   RoomPosition,
//   getDirection,
//   getRange,
//   getObjectById,
//   getObjectsByPrototype,
//   getTime
// } from "game";

// Everything can be imported either from the root /game module or corresponding submodules
// import { pathFinder } from "game";
// pathFinder.searchPath();
// import { prototypes } from "game";
// prototypes.Creep
// prototypes.RoomObject

// import {searchPath } from '/game/path-finder';
// import {Creep} from '/game/prototypes';

// This would work too:
// import * as PathFinder from '/game/path-finder'; --> PathFinder.searchPath
// import {Creep} from '/game/prototypes/creep';
// import * as prototypes from '/game/prototypes'; --> prototypes.Creep

// This stuff is arena-specific
import { ATTACK, HEAL, RANGED_ATTACK, OK } from "game/constants";
import { BodyPart, Flag } from "arena";
import { Creep, GameObject, StructureTower } from "game/prototypes";
import { getDirection, getObjectsByPrototype, getRange, getTicks, getObjectById } from "game/utils";
import { searchPath } from "game/path-finder";
import { TickState, newTick, loadedTickState } from "./tick-state";
import { towerDefense } from "./tower";
import { initializeGameState, getGameState } from "./game-state";
import { isBoolean } from "util";
import { truthy } from "utils/array";

declare module "game/prototypes" {
  interface Creep {
    initialPos: RoomPosition;
  }
}

export function loop(): void {
  newTick();
  if(getTicks() === 1) {
    initializeGameState();
  }

  const tickState = loadedTickState();

  const {
    myCreeps,
    towers
  } = tickState;

  defend();

  myCreeps.forEach((creep: Creep) => {
    // if (creep.body.some(i => i.type === ATTACK)) {
    //   meleeAttacker(creep);
    // }
    if (creep.body.some(i => i.type === RANGED_ATTACK)) {
      rangedAttacker(creep);
    }
    if (creep.body.some(i => i.type === HEAL)) {
      healer(creep);
    }
  });

  for (const tower of towers) {
    towerDefense(tower, tickState);
  }
}

function meleeAttacker(creep: Creep) {
  const { enemyCreeps } = loadedTickState();
  if (!creep.initialPos) {
    creep.initialPos = { x: creep.x, y: creep.y };
  }

  const targets = enemyCreeps
    .filter(i => getRange(i, creep.initialPos) < 10)
    .sort((a, b) => getRange(a, creep) - getRange(b, creep));

  if (targets.length > 0) {
    creep.moveTo(targets[0]);
    creep.attack(targets[0]);
  } else {
    creep.moveTo(creep.initialPos);
  }
}

function rangedAttacker(creep: Creep) {
  const { enemyCreeps, enemyFlag } = loadedTickState();
  const targets = enemyCreeps.sort((a, b) => getRange(a, creep) - getRange(b, creep));

  if (targets.length > 0) {
    creep.rangedAttack(targets[0]);
  }

  if (enemyFlag) {
    creep.moveTo(enemyFlag);
  }

  const range = 3;
  const enemiesInRange = enemyCreeps.filter(i => getRange(i, creep) < range);
  if (enemiesInRange.length > 0) {
    flee(creep, enemiesInRange, range);
  }
}

function healer(creep: Creep) {
  const { enemyCreeps, enemyFlag, myCreeps } = loadedTickState();
  const targets = myCreeps.filter(i => i !== creep && i.hits < i.hitsMax).sort((a, b) => a.hits - b.hits);

  if (targets.length) {
    creep.moveTo(targets[0]);
  } else {
    if (enemyFlag) {
      creep.moveTo(enemyFlag);
    }
  }

  const healTargets = myCreeps.filter(i => getRange(i, creep) <= 3).sort((a, b) => a.hits - b.hits);

  if (healTargets.length > 0) {
    if (getRange(healTargets[0], creep) === 1) {
      creep.heal(healTargets[0]);
    } else {
      creep.rangedHeal(healTargets[0]);
    }
  }

  const range = 7;
  const enemiesInRange = enemyCreeps.filter(i => getRange(i, creep) < range);
  if (enemiesInRange.length > 0) {
    flee(creep, enemiesInRange, range);
  }

  if (enemyFlag) {
    creep.moveTo(enemyFlag);
  }
}

function flee(creep: Creep, targets: GameObject[], range: number) {
  const result = searchPath(
    creep,
    targets.map(i => ({ pos: i, range })),
    { flee: true }
  );
  if (result.path.length > 0) {
    const direction = getDirection(result.path[0].x - creep.x, result.path[0].y - creep.y);
    creep.move(direction);
  }
}

function defend() {
  const { myFlag, enemyCreeps } = loadedTickState();
  const { defenders } = getGameState();
  const defendingCreeps = defenders.map(id => getObjectById(id)).filter(truthy);
  const sittingOnFlag = myFlag.findInRange(defendingCreeps, 0)[0];
  defendingCreeps.forEach(creep => {
    if (!sittingOnFlag && getRange(creep, myFlag) > 0) {
      console.log('moving', creep.id);
      creep.moveTo(myFlag);
    }

    if (creep.body.some(i => i.type === ATTACK)) {
      console.log('melee');
      const target = creep.findInRange(enemyCreeps, 1)[0];
      target && creep.attack(target);
    }
  });
}

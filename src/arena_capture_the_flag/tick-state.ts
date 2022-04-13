import { Flag } from "arena";
import { Creep, StructureTower } from "game/prototypes";
import { getDirection, getObjectsByPrototype, getRange, getTicks } from "game/utils";

let tickState: TickState | undefined;

export interface TickState {
  myCreeps: Creep[];
  enemyCreeps: Creep[];
  myFlag: Flag;
  enemyFlag: Flag;
  towers: StructureTower[];
}

function loadTickState(): TickState {
  const myCreeps = getObjectsByPrototype(Creep).filter(i => i.my);
  const enemyCreeps = getObjectsByPrototype(Creep).filter(i => !i.my);
  const towers = getObjectsByPrototype(StructureTower).filter(i => i.my);
  const flags = getObjectsByPrototype(Flag);
  const enemyFlag = flags.find(i => !i.my);
  const myFlag = flags.find(i => i.my);
  if (!enemyFlag) {
    throw new Error("No enemy flag found");
  }
  if (!myFlag) {
    throw new Error("No own flag found");
  }

  return {
    myCreeps,
    enemyCreeps,
    myFlag,
    enemyFlag,
    towers,
  };
};

export function loadedTickState() {
  tickState = tickState || loadTickState();
  return tickState;
}

export function newTick() {
  tickState = undefined;
}

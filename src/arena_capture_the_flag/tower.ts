import { TickState } from "./tick-state";
import { StructureTower } from "game/prototypes";
import { HEAL, RESOURCE_ENERGY, OK } from "game/constants";

export function towerDefense(tower: StructureTower, { myCreeps, enemyCreeps }: TickState) {
  const nearHostiles = tower.findInRange(enemyCreeps, 10);
  const hostiles = tower.findInRange(nearHostiles, 5);
  if (hostiles.length > 0) {
    const ret = tower.attack(hostiles[0]);
    if (ret !== OK) {
      console.log(tower.id, "towerDefense", "close attack failed", ret, tower.id, hostiles[0].id);
    }
    return;
  } else {
    const healers = tower.findInRange(myCreeps, 5)
      .filter(c => c.body.some(b => b.type === HEAL))
      .filter(c => c.hits < c.hitsMax);
    if (healers.length > 0) {
      const ret = tower.heal(healers[0]);
      if (ret !== OK) {
        console.log(tower.id, "towerDefense", "heal failed", ret, tower.id, healers[0].id);
      }
      return;
    }
  }

  // We have energy and no very close hostiles, throw something at a close enemy
  if (!tower.store.getFreeCapacity(RESOURCE_ENERGY)) {
    if (nearHostiles.length > 0) {
      const ret = tower.attack(nearHostiles[0]);
      if (ret !== OK) {
        console.log('towerDefense', 'near attack failed', ret, tower.id, nearHostiles[0].id);
      }
    } else {
      console.log(tower.id, "towerDefense", "no hostiles");
      const ret = tower.attack(enemyCreeps[0]);
      if (ret !== OK) {
        console.log('towerDefense', 'any attack failed', ret, tower.id, enemyCreeps[0].id);
      }
    }
  }
}

import { ErrorMapper } from "utils/ErrorMapper";
import { RoleManager } from "lib/RoleManager";
import { SpawnManager, SpawnTargets } from "lib/SpawnManager";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface SpawnMemory {
    totals: SpawnTargets;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    upgrading: boolean;
    building: boolean;
  }

  interface HarvesterMemory extends CreepMemory {
   resourceNode: Source
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

const spawnTargets: SpawnTargets = { harvesters: 2, haulers: 1, builders: 3, upgraders: 3 };

const roleManager = new RoleManager();
const spawnManager = new SpawnManager();
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  spawnManager.run();

  let texts = 0
  new RoomVisual().text( `Room Energy: ${Game.spawns["Spawn1"].room.energyAvailable}`, 48, 1, {align: 'right', color: "#32CD32"});
  for(const i in spawnManager.counter) {
    new RoomVisual().text( `${spawnManager.counter[i]}: ${i}`, 1, ++texts, {align: 'left', color: "#32CD32"});
  }

  for (const c in Game.creeps) {
    roleManager.run(Game.creeps[c]);
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

});

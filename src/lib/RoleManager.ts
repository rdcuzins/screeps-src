export enum Roles {
  Harvester = "harvester",
  Hauler = "hauler",
  Builder = "builder",
  Repairer = "repairer",
  Upgrader = "upgrader",
  Init = "init",
}

export interface RoleInfoItem {
  bodyBase: BodyPartConstant[]
  baseCost: number
  bodyUpgrade: BodyPartConstant[]
  upgradeCost: number
  priority: number
  max: number
}

export const RoleInfo: { [role: string]: RoleInfoItem } = {
  "harvester": {
    bodyBase: [WORK, WORK, MOVE],
    bodyUpgrade: [WORK, MOVE],
    baseCost: 200,
    upgradeCost: 150,
    priority: 1,
    max: 2,
  },
  "hauler": {
    bodyBase: [CARRY, CARRY, MOVE, MOVE],
    bodyUpgrade: [CARRY, MOVE],
    baseCost: 200,
    upgradeCost: 100,
    priority: 2,
    max: 3,
  },
  "upgrader": {
    bodyBase: [CARRY, WORK, MOVE],
    bodyUpgrade: [MOVE, WORK],
    upgradeCost: 150,
    baseCost: 200,
    priority: 2,
    max: 3,
  },
  "builder": {
    bodyBase: [CARRY, WORK, MOVE],
    bodyUpgrade: [WORK, MOVE],
    upgradeCost: 150,
    baseCost: 200,
    priority: 3,
    max: 3,
  },
  "repairer": {
    bodyBase: [CARRY, WORK, MOVE],
    bodyUpgrade: [WORK, MOVE],
    upgradeCost: 150,
    baseCost: 200,
    priority: 5,
    max: 3,
  },
}

export class RoleManager {
  public run = (creep: Creep) => {
    const role = creep.memory.role;

    switch (role) {
      case Roles.Init:
        this.initialize(creep);
        break;
      case Roles.Harvester:
        this.harvest(creep);
        break;
      case Roles.Upgrader:
        this.upgrade(creep);
        break;
      case Roles.Hauler:
        this.hauler(creep);
        break;
      case Roles.Builder:
        this.build(creep);
        break;
      case Roles.Repairer:
        this.repair(creep);
        break;
    }
  };

  private initialize(creep: Creep) {
    if(creep.store.getFreeCapacity() > 0){
      this.harvest(creep)
    } else {
      this.hauler(creep)
    }
  }

  private pickupResource(creep: Creep) {
    const containers = creep.room.find(FIND_STRUCTURES, { filter: (structure) => {
      return( structure.structureType == STRUCTURE_CONTAINER &&
        structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 50)
    }})
    if(containers.length > 0 && creep.memory.role !== Roles.Hauler) {
      if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) creep.moveTo(containers[0]);
    } else {
      const item = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: r => r.resourceType == RESOURCE_ENERGY && r.amount >= 150
      });
      if (!item) return;
      if (creep.pickup(item) == ERR_NOT_IN_RANGE) creep.moveTo(item);
    }
  }

  private repair(creep: Creep) {
    if(creep.store.getCapacity() > 0) {
      this.pickupResource(creep)
    }
    const targets = creep.room.find(FIND_STRUCTURES);
    const needsRepair = _.filter(targets, t => {
      return t.hits < t.hitsMax;
    });

    if (!needsRepair.length) return;

    let priority = needsRepair[0];
    for (const i in needsRepair) {
      if (needsRepair[i].hits < priority.hits) priority = needsRepair[i];
    }

    if (creep.repair(priority) == ERR_NOT_IN_RANGE) {
      creep.moveTo(priority);
    }
  }

  private hauler(creep: Creep) {
    let targets
    if (creep.store.getFreeCapacity() > 0) {
      this.pickupResource(creep)
    } else {
      // Find more critical structures
      targets = creep.room.find(FIND_STRUCTURES, {
        filter: structure => {
          return (
            (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      });
      // If no critical structures, find containers
      if (!targets.length) {
        targets = creep.room.find(FIND_STRUCTURES, {
          filter: structure => {
            return (
              structure.structureType == STRUCTURE_CONTAINER &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            )
          }
        })
      }

      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
      } else {
        // If no targets found, GTFO of the way
        creep.moveTo(Game.spawns[0])
      }
    }
  }

  private harvest(creep: Creep) {
    var sources = creep.room.find(FIND_SOURCES);
    if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[1], { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }

  private upgrade(creep: Creep) {
    if (creep.store[RESOURCE_ENERGY] == 0) creep.memory.upgrading = false;
    if (creep.store.getFreeCapacity() > 0 && !creep.memory.upgrading) {
      this.pickupResource(creep)
    } else {
      creep.memory.upgrading = true;
      if (!creep.room.controller) {
        creep.say("No controller here.");
        return;
      }
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }

  private build(creep: Creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.building = false;
      creep.say("🔄 pickup");
    }

    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }
    } else {
      this.pickupResource(creep)
    }
  }
}

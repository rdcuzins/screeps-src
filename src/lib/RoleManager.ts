export enum Roles {
  Harvester = "harvester",
  Builder = "builder",
  Upgrader = "upgrader"
}

export class RoleManager {

  public run = (creep: Creep) => {
    const role = creep.memory.role

    switch(role) {
      case Roles.Harvester:
        this.harvest(creep)
        break
      case Roles.Upgrader:
        this.upgrade(creep)
        break
    }
  }

  private harvest(creep: Creep) {
    const sources = creep.room.find(FIND_SOURCES)
    if(creep.store.getFreeCapacity() > 0){
      if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {visualizePathStyle: {stroke: "#ffaa00"}})
      }
    } else {
      if(creep.transfer(Game.spawns["Spawn1"], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(Game.spawns["Spawn1"], {visualizePathStyle: {stroke: "#ffaa00"}})
      }
    }
  }

  private upgrade(creep: Creep) {
    const sources = creep.room.find(FIND_SOURCES)
    if(creep.store[RESOURCE_ENERGY] == 0) creep.memory.upgrading = false
    if(creep.store.getFreeCapacity() > 0 && !creep.memory.upgrading){
      if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {visualizePathStyle: {stroke: "#ffaa00"}})
      }
    } else {
      creep.memory.upgrading = true
      if(!creep.room.controller) {
        creep.say("No controller here.")
        return
      }
      if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: "#ffaa00"}})
      }
    }
  }
}

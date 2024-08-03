import { Roles, RoleInfo, RoleInfoItem } from "./RoleManager"
import { roomNeedsBuild, roomNeedsRepair } from "./Room"

interface CustomCreep {
  body: string[]
  memory: CreepMemory
}

export interface SpawnTargets {
  harvesters: number
  upgraders: number
  builders: number
  haulers: number
}

export class SpawnManager {
  counter: { [role: string]: number }
  spawns: { [spawnname: string]: StructureSpawn }

  isFirstCreep: () => boolean = () => {
    for(const c in this.counter) {
      if(this.counter[c] > 0) return false
    }
    return true
  }

  constructor() {
    console.log("SpawnManager Initialized")
    this.spawns = Game.spawns
    this.counter = {}
  }

  public run(){
    this.counter = { "harvester": 0, "hauler": 0, "builder": 0, "upgrader": 0, "repairer": 0 }
    for(const c in Game.creeps) { this.counter[Game.creeps[c].memory.role]++ }
    const totalMemory = Game.spawns["Spawn1"].room.energyAvailable

    if (totalMemory < 200) return

    if(this.isFirstCreep())
      Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, MOVE], "init", { memory: <CreepMemory>{ "role": "init"}})

    if(this.counter[Roles.Harvester] == 0) {
      this.spawn(RoleInfo[Roles.Harvester], Roles.Harvester)
    } else if(this.counter[Roles.Hauler] == 0) {
      this.spawn(RoleInfo[Roles.Hauler], Roles.Hauler)
    } else {
      for(const role in RoleInfo) {
        const { max, priority } = RoleInfo[role]
        if(role == Roles.Repairer && !roomNeedsRepair(Game.spawns["Spawn1"].room)) continue
        if(role == Roles.Builder && !roomNeedsBuild(Game.spawns["Spawn1"].room)) continue
        if(max > this.counter[role]) {
          this.spawn(RoleInfo[role], <Roles>role)
        }
      }
    }
  }

  spawn({bodyBase, baseCost, upgradeCost, bodyUpgrade}: RoleInfoItem, role: Roles) {
    // const spawnItem = this.spawns["Spawn1"].spawning
    // if(spawnItem != null) {
    //   console.log(`Spawning Creep: ${role}`)
    //   console.log(JSON.stringify(spawnItem))
    //   return
    // }
    let body: BodyPartConstant[] = bodyBase
    const totalEnergy = this.spawns["Spawn1"].room.energyAvailable

    if(totalEnergy >= (baseCost + upgradeCost)) {
      // Figure out maximum upgrade body
      body.push(...bodyUpgrade)
    }
    this.spawns["Spawn1"].spawnCreep(body, `${role}_${Game.time}`, { memory: <CreepMemory | HarvesterMemory>{"role": role} })
  }
}

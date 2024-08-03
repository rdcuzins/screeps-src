interface CustomCreep {
  body: string[]
  memory: CreepMemory
}

export interface SpawnTargets {
  harvesters: number
  upgraders: number
  builders: number
}

export class SpawnManager {
  spawnTargets: SpawnTargets
  harvesterCount: number = 0
  builderCount: number = 0
  upgraderCount: number = 0
  spawns: { [spawnname: string]: StructureSpawn }


  constructor(spawnTargets: SpawnTargets) {
    this.spawnTargets = spawnTargets
    this.spawns = Game.spawns
  }

  public run(){
    this.harvesterCount = _.filter(Game.creeps, (creep) => {return creep.memory.role === "harvester"}).length
    this.builderCount = _.filter(Game.creeps, (creep) => {return creep.memory.role === "builder"}).length
    this.upgraderCount = _.filter(Game.creeps, (creep) => {return creep.memory.role === "upgrader"}).length

    if(this.harvesterCount < this.spawnTargets.harvesters) {
      for(const i in this.spawns){
        if(this.spawns[i].spawning) return
        const res = this.spawns[i].spawnCreep([MOVE, CARRY, WORK], `Hv${Game.time}`, { memory: <CreepMemory>{"role": "harvester"} })
        if (res == 0) {
          console.log("Spawned new harvester.")
          this.harvesterCount++
        }
      }
    }

    if(this.upgraderCount < this.spawnTargets.upgraders) {
      for(const i in this.spawns){
        if(this.spawns[i].spawning) return
        const res = this.spawns[i].spawnCreep([MOVE, CARRY, WORK], `Ug${Game.time}`, { memory: <CreepMemory>{"role": "upgrader", "upgrading": false} })
        if (res == 0) {
          console.log("Spawned new upgrader.")
          this.upgraderCount++
        }
      }
    }
  }
}

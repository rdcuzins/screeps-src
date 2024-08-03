export const roomNeedsRepair: (room: Room) => boolean = (room: Room) => {
  const structures = room.find(FIND_STRUCTURES, { filter: (s) => {
    return (s.structureType == STRUCTURE_WALL || STRUCTURE_RAMPART ||
      STRUCTURE_TOWER || STRUCTURE_CONTAINER || STRUCTURE_ROAD && s.hits < s.hitsMax)
  }})

  return structures.length > 0
}


export const roomNeedsBuild: (room: Room) => boolean = (room: Room) => {
  return room.find(FIND_CONSTRUCTION_SITES).length > 0
}

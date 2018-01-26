const path = require('path');
const fs = require('fs');
const mustache = require('mustache');

// ------------------------------

function getList (floors) {
  const templatePath = '../src/templates/components/_rooms.html';
  const view = {
    floors: floors
  };

  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, templatePath), 'utf8', (err, template) => {
      if (err) throw err;

      resolve(mustache.render(template, view));
    });
  });
}

// ------------------------------

function getRoomsData (data, selectedId) {
  const roomsData = [];

  data.forEach(item => {
    const itemData = item.dataValues;
    itemData.checked = '';

    if (itemData.id === +selectedId) {
      itemData.checked = 'checked';
    }
    roomsData.push(itemData);
  });

  return roomsData;
}

// ------------------------------

function getRoomsByFloors (data) {
  const floorsWithRooms = {};
  const floors = [];

  data.forEach(room => {
    const roomData = room.dataValues;
    const roomsObj = {
      id: roomData.id,
      title: roomData.title,
      capacity: roomData.capacity
    };

    if (!floorsWithRooms[roomData.floor]) {
      floorsWithRooms[roomData.floor] = {
        rooms: {},
        roomsList: []
      };
    }

    floorsWithRooms[roomData.floor].rooms[roomData.id] = roomsObj;
    floorsWithRooms[roomData.floor].roomsList.push(roomsObj);
  });

  for (let floor in floorsWithRooms) {
    const floorData = {
      number: floor,
      rooms: floorsWithRooms[floor].roomsList
    };
    floors.push(floorData);
  }

  return {
    list: floors,
    obj: floorsWithRooms
  };
}

// ------------------------------

module.exports = {
  getList: getList,
  getRoomsData: getRoomsData,
  getRoomsByFloors: getRoomsByFloors
};

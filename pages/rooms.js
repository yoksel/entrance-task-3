'use strict';

const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
const tools = require('./tools');

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

function getPageData (data) {
  const roomsData = {};

  data.forEach(item => {
    roomsData[item.id] = item.dataValues;
  });

  return roomsData;
}

// ------------------------------

function fillRooms (data) {
  const title = data.title;
  const rooms = data.rooms;
  const roomId = data.roomId;

  const mods = ['rooms'];

  if (!roomId) {
    mods.push('hidden');
  }

  return {
    default: roomId,
    group: {
      title: title,
      class: tools.addMods({
        class: 'form__group',
        mods: mods
      })
    },
    list: getRoomsData(rooms, roomId),
    mod: 'select-room--room-selected'
  };
}

// ------------------------------

function getRoomsByFloors (rooms) {
  const floorsWithRooms = {};
  const floorsList = [];

  rooms.forEach(room => {
    const roomsObj = {
      id: room.id,
      title: room.title,
      capacity: room.capacity
    };

    if (!floorsWithRooms[room.floor]) {
      floorsWithRooms[room.floor] = {
        rooms: {},
        roomsList: []
      };
    }

    floorsWithRooms[room.floor].rooms[room.id] = roomsObj;
    floorsWithRooms[room.floor].roomsList.push(roomsObj);
  });

  for (let floor in floorsWithRooms) {
    const floorData = {
      number: floor,
      rooms: floorsWithRooms[floor].roomsList
    };
    floorsList.push(floorData);
  }

  return {
    list: floorsList,
    obj: floorsWithRooms
  };
}

// ------------------------------

function sortByFloor (a, b) {
  const aFloor = a.dataValues.floor;
  const bFloor = b.dataValues.floor;

  if (aFloor > bFloor) {
    return 1;
  } else if (aFloor < bFloor) {
    return -1;
  }

  return 0;
}

// ------------------------------

module.exports = {
  getList: getList,
  getPageData: getPageData,
  getRoomsData: getRoomsData,
  getRoomsByFloors: getRoomsByFloors,
  fillRooms: fillRooms,
  sortByFloor: sortByFloor
};

const tools = require('./tools');
const rooms = require('./rooms');
const config = require('./config');
const moment = require('moment');
moment.locale('ru');

const hours = fillHours();

// ------------------------------

function fillHours () {
  const hours = [];
  const startHour = config.startHour;
  const hoursInDay = config.hoursInDay;

  for (let i = startHour; i < (startHour + hoursInDay); i++) {
    hours.push(i);
  }

  return hours;
}

// ------------------------------

function getShedule (params) {
  const events = params.events;
  const floors = params.floors;
  const isHasItems = params.isHasItems;
  const shedule = {};
  let sheduleList = [];

  tools.daysList.forEach(day => {
    shedule[day.key] = {};
    shedule[day.key].day = day;
    shedule[day.key].floors = getSheduleForFloor(floors.obj, day, events, isHasItems);
  });

  return shedule;
}

// ------------------------------

function getSheduleForFloor (floorsObj, day, events, isHasItems) {
  const shedule = JSON.parse(JSON.stringify(floorsObj));

  for (let floorNum in shedule) {
    const floor = shedule[floorNum];

    for (let roomId in floor.rooms) {
      const room = floor.rooms[roomId];
      // console.log('\n-- ROOM:', roomId, room.title);
      room.slots = [];
      let date = moment(day.code);
      let startTime = moment(day.code).hours(config.startHour);
      let endTime = moment(day.code).hours(config.lastHour);

      hours.forEach(hour => {

        let startTimeIso = moment(day.code).hours(hour).toISOString();

        events.forEach(event => {
          const eventStart = moment(event.dateStart);
          const eventStartHour = moment(event.dateStart).minute(0).second(0).millisecond(0);
          const eventStartTimeIso = eventStartHour.toISOString();

          const eventDayCode = tools.getDayCode(event.dateStart);

          if (event.RoomId === +roomId && eventStartTimeIso === startTimeIso) {

            const eventStartTime = moment(event.dateStart);
            const eventEndTime = moment(event.dateEnd);

            // Fill empty slot
            const emptySlot = {
              start: startTime,
              end: eventStartTime,
              event: null,
              room: roomId,
              items: fillItems({
                start: startTime,
                end: eventStartTime,
                room: roomId,
                isHasItems: isHasItems
              })
            };

            // Fill event slot
            const eventSlot = {
              start: eventStartTime,
              end: eventEndTime,
              event: event,
              users: event.users,
              room: roomId,
              items: fillItems({
                start: eventStartTime,
                end: eventEndTime,
                room: roomId,
                event: event,
                isHasItems: isHasItems
              })
            };

            room.slots.push(emptySlot);
            room.slots.push(eventSlot);

            startTime = eventEndTime;
          }
        }); // end events

        // Fill trailing slot
        if (+hour === config.lastHour - 1) {
          const emptySlot = {
            start: startTime,
            end: endTime,
            event: null,
            room: roomId,
            items: fillItems({
              start: startTime,
              end: endTime,
              room: roomId,
              isHasItems: isHasItems
            })
          };

          room.slots.push(emptySlot);
        }
      });
    }
  }

  return shedule;
}

// ------------------------------

function fillItems(params) {
  if (!params.isHasItems) {
    return null;
  }

  const startDateTime = params.start;
  const endDateTime = params.end;
  const roomId = params.room;
  const event = params.event;
  const items = [];

  const startTime = {
    hours: startDateTime.format('H'),
    mins: startDateTime.format('mm')
  };

  const endTime = {
    hours: endDateTime.format('H'),
    mins: endDateTime.format('mm')
  };

  if (+endTime.hours === 0) {
    endTime.hours = 24;
  }

  const durationHours = endTime.hours - startTime.hours;
  // Quantity of buttons
  let itemsQuantity = durationHours;

  if (event) {
    // Long button
    itemsQuantity = 1;
  }

  // Fill each hour
  for(let h = 0; h < itemsQuantity; h ++) {
    const item = {};
    let buttonWidth = 1;

    if (h === 0 && startTime.mins > 0){
      const startMins = startTime.mins / 60;
      buttonWidth -= startMins;
    }
    else if (h === durationHours - 1 && endTime.mins > 0){
      const endMins = endTime.mins / 60;
      buttonWidth += endMins;
    }

    const dateTime = moment(startDateTime).add(h, 'h');
    if (!event && h > 0) {
      // Set time to start of hour
      dateTime.minute(0).second(0).millisecond(0);
    }

    const dateTimeStr = dateTime.toISOString();
    let mod = '';
    let buttonMod = 'button--blue';
    let url = `./create?roomId=${roomId}&dateTime=${dateTimeStr}`;
    let data = '';

    if (event) {
      const eventDurationMs = endDateTime .valueOf() - startDateTime.valueOf();
      const eventDurationHours = eventDurationMs / 1000 / 60 / 60;
      buttonWidth = eventDurationHours;

      mod = 'slot--has-event';
      buttonMod = 'button-show-event';
      url = `./edit?event-id=${event.id}`;
      data = `data-event-id="${event.id}"`;
    }

    items.push({
      style: `style="flex-basis: ${buttonWidth * config.slotHourWidth}%"`,
      hour: dateTime.format('H'),
      mins: dateTime.format('mm'),
      mod: mod,
      buttonMod: buttonMod,
      url: url,
      data: data
    });
  }

  return items;
}

// ------------------------------

function sheduleToList (shedule) {
  const sheduleList = [];

  for (let dayKey in shedule) {
    const day = shedule[dayKey];
    const floors = [];
    const dayClass = tools.addMods({
      class: 'shedule__day',
      mods: [dayKey],
      isCurrent: dayKey === tools.todayDayKey

    });

    for (let floorNum in day.floors) {
      const floor = day.floors[floorNum];
      const roomsList = Object.keys(floor.rooms).map(num => {
        return floor.rooms[num];
      });

      floors.push({
        floor: floorNum,
        rooms: roomsList
      });
    }

    sheduleList.push({
      dayKey: dayKey,
      floors: floors,
      class: dayClass
    });
  }

  return sheduleList;
}

// ------------------------------

function sheduleToSlotsList (shedule) {
  let sheduleSlotsList = {};

  for (let dayKey in shedule) {
    const day = shedule[dayKey];
    const floors = [];
    const dayClass = tools.addMods({
      class: 'shedule__day',
      mods: [dayKey],
      isCurrent: dayKey === tools.todayDayKey
    });

    sheduleSlotsList[dayKey] = [];

    for (let floorNum in day.floors) {
      const floor = day.floors[floorNum];
      const roomsList = Object.keys(floor.rooms).map(num => {
        return floor.rooms[num];
      });

      // console.log('\nROOMSLIST\n');
      // console.log(roomsList);

      roomsList.forEach(room => {
        // console.log(room.slots);
        sheduleSlotsList[dayKey] = sheduleSlotsList[dayKey].concat(room.slots)
      })

      floors.push({
        floor: floorNum,
        rooms: roomsList
      });
    }

    // sheduleSlotsList.push({
    //   dayKey: dayKey,
    //   floors: floors,
    //   class: dayClass
    // });
  }

  // console.log('sheduleSlotsList[30-Jan]');
  // console.log(sheduleSlotsList['30-Jan']);

  return sheduleSlotsList;
}

// ------------------------------

function getSheduleList(events, floors) {
  const shedule = getShedule (events, floors);

  return sheduleToList(shedule);
}

// ------------------------------

function getSlotsList(events, floors) {
  const shedule = getShedule (events, floors);

  return sheduleToSlotsList(shedule);
}

// ------------------------------

module.exports = {
  getSheduleList: getSheduleList,
  getSlotsList: getSlotsList,
  getShedule: getShedule
};

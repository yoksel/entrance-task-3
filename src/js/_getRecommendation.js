'use strict';

/* global moment, pageData, selectUser, selectRoom */

(function (window) {
  if (!pageData.slots) {
    return;
  }

  const form = document.querySelector('.form--event');
  const dayCode = form.querySelector('.select-datetime__daycode');
  const dateTimeInput = form.querySelector('.select-datetime__input');
  const timeFromInput = form.querySelector('.select-datetime__time--from');
  const timeToInput = form.querySelector('.select-datetime__time--to');
  const defaultRoom = form.querySelector('.select-room__default');
  const eventIdElem = form.querySelector('.form__itemid');

  const dateTimeSet = [
    {
      input: dayCode,
      value: dayCode.value,
    },
    {
      input: timeFromInput,
      value: timeFromInput.value,
    },
    {
      input: timeToInput,
      value: timeToInput.value,
    }
  ];

  let dateTimeIsChanged = false;

  addListeners();

  // ------------------------------

  function getRecommendation (date, members, db) {
    const recommendation = {};
    const dateStart = moment(date.start);
    const dayKey = dateStart.locale('en').format('D-MMM');
    const dateEnd = moment(date.end);
    const dateIso = {
      start: dateStart.toISOString(),
      end: dateEnd.toISOString()
    };
    const slots = db.slots[dayKey];

    recommendation.date = date;
    recommendation.rooms = chooseRoom(dateIso, slots, members, db.rooms);

    if (recommendation.rooms.length === 0) {
      recommendation.swaps = getSwaps(dateIso, slots, members, db);
    }

    return recommendation;
  }

  // ------------------------------

  function addListeners () {
    if (!dayCode) {
      return;
    }

    // DateTime inputs
    let inputsListeners = [
      dateTimeInput,
      timeFromInput,
      timeToInput
    ];

    inputsListeners.forEach(elem => {
      elem.addEventListener('input', updateRecommendation);
      elem.addEventListener('change', updateRecommendation);
    });
  }

  // ------------------------------

  function updateRecommendation () {
    const data = collectData();

    if (!data) {
      return;
    }

    const recommendation = getRecommendation(data.date, data.members, data.db);

    selectRoom.setRooms(recommendation, defaultRoom.value);

    if (recommendation.swaps && recommendation.swaps.length > 0) {
      selectRoom.showSwaps(recommendation);
    }

  }

  // ------------------------------

  function collectData () {
    const valuesToCheck = [dayCode.value, timeFromInput.value, timeToInput.value];

    const isValuesExists = valuesToCheck.every(value => {
      return value;
    });

    if (!isValuesExists) {
      return null;
    }

    const day = moment(dayCode.value);
    const timeFromSet = timeFromInput.value.split(':');
    const timeFrom = day.clone().hour(timeFromSet[0]).minute(timeFromSet[1]);
    const timeToSet = timeToInput.value.split(':');
    const timeTo = day.clone().hour(timeToSet[0]).minute(timeToSet[1]);
    const date = {
      start: timeFrom.toISOString(),
      end: timeTo.toISOString()
    };
    const members = getMembersIds();

    return {
      date: date,
      members: members,
      db: pageData
    };
  }

  // ------------------------------

  function getMembersIds () {
    const members = [];
    const membersInputs = form.usersIds;

    membersInputs.forEach = [].forEach;
    membersInputs.forEach(input => {
      if (input.checked) {
        members.push(pageData.users[input.value]);
      }
    });

    return members;
  }

  // ------------------------------

  function chooseRoom (dateIso, slots, members, rooms) {
    const nearest = [];
    const foundedSlots = [];

    if (!slots) {
      return nearest;
    }

    slots.forEach(slot => {
      if (!slot.event) {
        if (slot.start <= dateIso.start && slot.end >= dateIso.end) {
          foundedSlots.push(slot);
        }
      }
    });

    for (let i = 0; i < foundedSlots.length; i++) {
      const slot = foundedSlots[i];
      const room = rooms[slot.room];
      const floor = room.floor;
      const capacity = room.capacity;
      let steps = 0;

      if (members.length > capacity) {
        continue;
      }

      members.forEach(member => {
        steps += Math.abs(floor - member.homeFloor);
      });

      nearest.push({
        room: slot.room,
        steps: steps
      });
    }

    nearest.sort(sortBySteps);

    const roomIds = nearest.map(item => {
      return item.room;
    });

    return roomIds;
  }

  // ------------------------------

  function getSwaps (dateIso, slots, members, db) {
    const foundedSwaps = [];

    slots.forEach(slot => {
      if (slot.event) {
        if (slot.start <= dateIso.start && slot.end >= dateIso.end) {
          if (slot.swapReady) {
            const event = db.events[slot.event.id];
            const rooms = chooseRoom(event.dateSrc, slots, event.users, db.rooms);

            if (rooms.length > 0) {
              foundedSwaps.push({
                event: slot.event.id,
                room: rooms[0]
              });
            }
          }
        }
      }
    });

    return foundedSwaps;
  }

  // ------------------------------

  function sortBySteps (a, b) {
    const aSteps = a.steps;
    const bSteps = b.steps;

    if (aSteps > bSteps) {
      return 1;
    } else if (aSteps < bSteps) {
      return -1;
    }

    return 0;
  }
  // ------------------------------

  window.updateRecommendation = updateRecommendation;
}(window));

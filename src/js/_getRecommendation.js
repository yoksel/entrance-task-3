'use strict';

/* global moment, selectUser, selectRoom */

(function(window) {
  if (!pageData.shedule) {
    return;
  }

  console.log(pageData.shedule);
  const form = document.querySelector('.form');
  const dayCode = form.querySelector('.select-datetime__daycode');
  const dateTimeInput = form.querySelector('.select-datetime__input');
  const timeFromInput = form.querySelector('.select-datetime__timefrom');
  const timeToInput = form.querySelector('.select-datetime__timeto');
  const defaultRoom = form.querySelector('.select-room__default');

  addListeners();

  // ------------------------------

  function getRecommendation(date, members, db) {
    console.log('getRecommendation for', date);
    const recommendation = {};
    const dateStart = moment(date.start);
    const dateStartIso = dateStart.toISOString();
    const dateEnd = moment(date.end);
    const dateEndIso = dateEnd.toISOString();
    const dayKey = dateStart.locale('en').format('D-MMM');
    const floors = db.shedule[dayKey].floors;
    const floorsList = Object.values(floors);
    let foundedSlots = [];

    floorsList.forEach(floor => {
      const roomsList = Object.values(floor.rooms);
      roomsList.forEach(room => {

        room.slots.forEach(slot => {
          if (!slot.event) {
            if (slot.start <= dateStartIso && slot.end >= dateEndIso) {
              foundedSlots.push(slot);
            }
          }
        });
      })
    });

    recommendation.rooms = chooseRoom(foundedSlots, members, db.rooms);

    return recommendation;
  }

  // ------------------------------

  function checkUsers(date, members, db) {
    const checkedUsers = [];
    const dateStart = moment(date.start);
    const dateStartIso = dateStart.toISOString();
    const dateEnd = moment(date.end);
    const dateEndIso = dateEnd.toISOString();
    const dayKey = dateStart.locale('en').format('D-MMM');
    const floors = db.shedule[dayKey].floors;
    const floorsList = Object.values(floors);
    let foundedUsers = [];

    const membersList = members.map(member => {
      return member.id;
    });

    floorsList.forEach(floor => {
      const roomsList = Object.values(floor.rooms);
      roomsList.forEach(room => {

        room.slots.forEach(slot => {
          if (slot.event) {
            if ((dateStartIso >= slot.start && dateStartIso <= slot.end) ||
                (dateEndIso >= slot.start && dateEndIso <= slot.end)) {
              const usersList = Object.values(slot.users);
              foundedUsers = usersList.filter(user => {
                if (membersList.indexOf(user.id) >= 0){
                  return user.id;
                }
              });

            }

          }
        });
      })
    });
    console.log('foundedUsers', foundedUsers);

    const foundedIdList = foundedUsers.map(user => {
      return user.id;
    });

    return foundedIdList;
  }

  // ------------------------------

  function addListeners() {
    if(!dayCode) {
      return;
    }

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

  function updateRecommendation() {
    console.log('updateRecommendation');
    const data = collectData();
    const recommendation = getRecommendation(data.date, data.members, data.db);
    // console.log('\n\nrecommendation', recommendation);

    if (recommendation.rooms.indexOf(defaultRoom.value) < 0) {
      selectRoom.setRooms(recommendation.rooms, data.date);
    }

    const checkedUsers = checkUsers(data.date, data.members, data.db);

    if (checkedUsers.length > 0) {
      // checkedUsers
      selectUser.highlightUsers(checkedUsers);
    }

    console.log('---------------------');
  }

  // ------------------------------

  function collectData() {
    const members = getMembersIds();
    const day = moment(dayCode.value);
    const timeFromSet = timeFromInput.value.split(':');
    const timeFrom = day.clone().hour(timeFromSet[0]).minute(timeFromSet[1]);
    const timeToSet = timeToInput.value.split(':');
    const timeTo = day.clone().hour(timeToSet[0]).minute(timeToSet[1]);
    const date = {
      start: timeFrom.toISOString(),
      end: timeTo.toISOString()
    };

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
      if(input.checked) {
        members.push(pageData.users[input.value]);
      }
    });

    return members;
  }

  // ------------------------------

  function chooseRoom(slots, members, rooms) {
    const nearest = slots.filter(slot => {
      const room = rooms[slot.room];
      const floor = room.floor;
      const capacity = room.capacity;
      let steps = 0;

      if(members.length > capacity) {
        return;
      }

      members.forEach(member => {
        steps += Math.abs(floor - member.homeFloor);
      });

      return {
        room: slot.room,
        steps: steps
      };
    });

    nearest.sort(sortBySteps);

    const roomIds = nearest.map(item => {
      return item.room;
    });

    return roomIds;
  }

  // ------------------------------

  function sortBySteps(a,b) {
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

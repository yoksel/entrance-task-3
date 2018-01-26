const resolvers = require('../graphql/resolvers')();
const query = resolvers.Query;
const mutation = resolvers.Mutation;
const moment = require('moment');
moment.locale('ru');

const tools = require('./tools');
const rooms = require('./rooms');
const users = require('./users');
const pageData = {
  events: {}
};

const data = {};
const partials = {};
let pageResponse = null;
let pageReq = null;
let pageReqBody = null;

// ------------------------------

function getPage (req, res) {
  pageResponse = res;
  pageReq = req;
  pageReqBody = req.body;

  console.log('\n\n++ pageReqBody ++');
  console.log(pageReqBody);

  const dataProms = [
    query.events(),
    query.rooms(),
    query.users()
  ];

  Promise.all(dataProms)
    .then(
      response => {
        data.events = response[0];
        data.rooms = response[1].sort(tools.sortByFloor);
        data.floors = rooms.getRoomsByFloors(data.rooms);
        data.users = response[2];
        data.shedule = fillShedule();

        const partialsProms = [
          tools.getDaysNav(),
          rooms.getList(data.floors.list),
          tools.getHoursNav({
            start: tools.startHour,
            hoursInDay: tools.hoursInDay
          }),
          tools.getPopupCalendar()
        ];

        return Promise.all(partialsProms);
      },
      error => {
        console.log('\nPromises in getPage() failed:');
        console.log(error);
      }
    )
    .then(
      response => {
        partials.daysNav = response[0];
        partials.roomsList = response[1];
        partials.hoursNav = response[2];
        partials.popupCalendar = response[3];

        if (!pageReqBody.action) {
          renderPage();
          return;
        }

        handleRequest();
      },
      error => {
        console.log('\nPromises in getPage() failed:');
        console.log(error);
      }
    );
}

// ------------------------------

function handleRequest() {
  console.log('handleRequest()');
  // console.log('data.events');
  // console.log(data.events);
  const matches = tools.findMatches(data.events, pageReqBody);


  console.log('matches');
  console.log(matches);

  // console.log(pageReqBody);

  if (pageReqBody.action == 'create') {
    // Dont check unique names
    // Check users in other events
    // console.log(matches.byDateUsers);
    if (matches.byDateUsers.length > 0) {
      const users = getLoginsByIds(matches.byDateUsers);

      actionError = `Событие <b>«${pageReqBody.title}»</b> не было создано, потому что некоторые сотрудники <i>${users.join(', ')}</i> будут в это время на другой встрече`;

      queryEvents();
    }
    else if (matches.byDateRoom > 0) {
      actionError = `Событие <b>«${pageReqBody.title}»</b> не было создано, потому что до завершения этого события в этой переговорке начнётся другое`;

      queryEvents();
    }
    else {
      createEvent();
    }
  }

  else if (pageReqBody.action == 'remove' && matches.byId > 0) {
    console.log('removeEvent');
    removeEvent();
  }

  //
  else if (pageReqBody.action == 'update') {
    if (pageReqBody.save) {
      updateEvent();
    }

    else {
      renderPage();
    }
  }
  // Unhandled action
  else {
    renderPage();
  }
}

// ------------------------------

function createEvent() {
  const dateTimeStart = moment(pageReqBody.daycode);

  const timeTo = pageReqBody.timeTo.split(':');
  const dateTimeEnd = dateTimeStart.clone().hours(timeTo[0]).minutes(timeTo[1]);
  let users = [];

  if (typeof pageReqBody.users === 'string'){
    users = [pageReqBody.users];
  }
  else {
    pageReqBody.users.map(userId => {
    return +userId;
  });
  }

  mutation.createEvent(global, {
    input: {
      title: pageReqBody.subject,
      dateStart: dateTimeStart.toISOString(),
      dateEnd: dateTimeEnd.toISOString()
      },
     usersIds: pageReqBody.users,
     roomId: pageReqBody.roomId
  })
    .then(
      response => {
        actionMessage = `Событие <b>«${response.dataValues.title}»</b> создано.`;
        queryEvents();
      },
      error => {
        console.log('\nremoveEvent() failed');
        console.log(error);
      }
    );
}

// ------------------------------

function removeEvent() {
  mutation.removeEvent(
      global,
      { id: pageReqBody.itemid }
    )
    .then(
      response => {
        queryEvents();
      },
      error => {
        console.log('\nremoveEvent() failed');
        console.log(error);
      }
    );
}

// ------------------------------

function queryEvents() {
  query.events()
    .then(
      response => {
        data.events = response;
        data.shedule = fillShedule();

        renderPage();
      },
      error => {
        console.log('\nPromises in queryEvents() failed:');
        console.log(error);
      }
    );
}

// ------------------------------

function renderPage () {

  console.log('\ndata.shedule');
  // console.log(data.shedule[0].floors[0].rooms[0]);

  pageResponse.render(
    'index',
    {
      days: tools.daysList,
      rooms: partials.roomsList,
      hours: tools.hoursInDay,
      hoursNav: partials.hoursNav,
      sheduleDays: data.shedule,
      popupCalendar: partials.popupCalendar,
      pageData: JSON.stringify(pageData),
      partials: {
        'symbols': 'components/_symbols',
        'page-header': 'components/_page-header',
        'shedule': 'components/_shedule',
        'days-nav': 'components/_days-nav',
        'popup--calendar': 'components/_popup--calendar',
        'popup--view-info': 'components/_popup--view-info',
        'popup--event-created': 'components/_popup--event-created'
      }
    }
  );
}

// ------------------------------

function fillShedule() {
  console.log('\n\nfillShedule()');

  const shedule = {};
  let sheduleList = [];
  const slotWidth = 20; // px;

  tools.daysList.forEach(day => {
    shedule[day.key] = {};
    shedule[day.key].day = day;
    shedule[day.key].floors = tools.getEmptySheduleForFloor(data.floors.obj, day);
  });

  // Fill shedule with events
  data.events.forEach((event) => {
    const itemData = event.dataValues;
    const roomId = itemData.RoomId;
    const floor = event.room.dataValues.floor;
    const duration = tools.getEventDuration(itemData);
    const durationInSlots = duration / tools.eventsStep;

    // console.log('itemData.start');
    // console.log(itemData.title, itemData.RoomId);
    // console.log(moment(itemData.dateStart).format('D MMMM YY h:mm'));

    const date = {
      start: tools.parseDate(itemData.dateStart),
      end: tools.parseDate(itemData.dateEnd)
    };
    const dayKey = tools.getDayKey(itemData.dateStart);

    // Old events
    if (!shedule[dayKey]) {
      return;
    }
    const dayRoomShedule = shedule[dayKey].floors[floor].rooms[roomId];

    let foundedIndex = null;
    const eventsFiltered = dayRoomShedule.events.filter((slot, i) => {
      if (+date.start.hours === slot.hour &&
        +date.start.mins >= slot.mins) {
        foundedIndex = i;

        return slot;
      }
    });

    const eventSlot = eventsFiltered[0];

    if (eventSlot) {
      const style = `width: ${durationInSlots * slotWidth}px`;
      eventSlot.event = event;
      eventSlot.eventDuration = duration;
      eventSlot.eventSlots = durationInSlots;
      eventSlot.mod = 'slot--has-event';
      eventSlot.style = `style="${style}"`;
      eventSlot.buttonMod = 'button-show-event';
      eventSlot.url = `./edit?event-id=${event.id}`;
      eventSlot.data = `data-event-id="${event.id}"`;

      pageData.events[event.id] = {
        id: event.id,
        title: event.title,
        room: event.room.title,
        date: tools.prettyDate(event),
        users: users.getEventUsers(event.users)
      };

      if (durationInSlots > 1) {
        // Cut out filled days
        dayRoomShedule.events.splice(foundedIndex + 1, durationInSlots - 1);
      }
    } else {
      // console.log('\n\neventSlot[0] not found, may be already filled or it\'s not working hours\n');
    }
  });

  sheduleList = sheduleToList(shedule);

  return sheduleList;
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

module.exports.index = getPage;

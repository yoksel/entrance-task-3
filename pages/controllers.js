'use strict';

const resolvers = require('../graphql/resolvers')();
const query = resolvers.Query;
const mutation = resolvers.Mutation;
const moment = require('moment');
moment.locale('ru');

const config = require('./config');
const tools = require('./tools');
const events = require('./events');
const rooms = require('./rooms');
const shedule = require('./shedule');
const pageData = {
  events: {}
};

const data = {};
const partials = {};
let pageResponse = null;
let pageReqBody = null;
let lastActionId = null;

// ------------------------------

function handleRequest (req, res) {
  pageResponse = res;
  pageReqBody = req.body;
  data.eventCreatedtId = null;
  data.eventUpdatedtId = null;

  query.events()
    .then(response => {
      data.events = response;

      if (pageReqBody.action) {
        if (pageReqBody.actionId === lastActionId) {
          // Page wath reloaded after submit
          // Action was handled already, skip request
          getPage();
          return;
        } else {
          lastActionId = pageReqBody.actionId;
        }
      }

      if (pageReqBody.action === 'create') {
        const matches = tools.findMatches(data.events, pageReqBody);

        if (pageReqBody.swapEvent) {
          swapEvent();
        } else if (matches.byDateRoom > 0) {
          // Room & date match
          getPage();
        } else {
          createEvent();
        }
      } else if (pageReqBody.action === 'remove') {
        removeEvent();
      } else if (pageReqBody.action === 'update') {
        updateEvent();
      } else {
        // Unhandled action
        getPage();
      }
    })
    .catch((error) => {
      console.log('\nPromises in handleRequest() failed:');
      console.log(error);
    });
}

// ------------------------------

function getPage () {
  const dataProms = [
    query.events(),
    query.rooms(),
    query.users()
  ];

  Promise.all(dataProms)
    .then(response => {
      data.events = response[0];
      data.rooms = response[1].sort(rooms.sortByFloor);
      data.floors = rooms.getRoomsByFloors(data.rooms);
      data.shedule = shedule.getSheduleList({
        events: data.events,
        floors: data.floors,
        isHasItems: true
      });
      data.users = response[2];

      const partialsProms = [
        tools.getDaysNav(),
        rooms.getList(data.floors.list),
        tools.getHoursNav(),
        tools.getPopupCalendar()
      ];

      return Promise.all(partialsProms);
    })
    .then(response => {
      partials.daysNav = response[0];
      partials.roomsList = response[1];
      partials.hoursNav = response[2];
      partials.popupCalendar = response[3];

      renderPage();
    })
    .catch((error) => {
      console.log('\nPromises in getPage() failed:');
      console.log(error);
    });
}

// ------------------------------

function swapEvent () {
  // Move event
  mutation.changeEventRoom(global, {
    id: pageReqBody.swapEvent,
    roomId: pageReqBody.swapToRoom
  })
    .then(response => {
        // Update/create second event
      if (pageReqBody.itemid) {
        updateEvent();
      } else {
        createEvent();
      }
    })
    .catch((e) => {
      console.log('\nswapEvent failed: ');
      console.log(e);
      getPage();
    });
}

// ------------------------------

function createEvent () {
  if (!pageReqBody.title || pageReqBody.usersIds.length === 0 || !pageReqBody.roomId) {
    // No data for event, event NOT created
    getPage();
    return;
  }

  const dateStart = moment(pageReqBody.daycode);
  const timeFrom = pageReqBody.timeFrom.split(':');
  const dateTimeStart = dateStart.hour(timeFrom[0]).minute(timeFrom[1]);
  const timeTo = pageReqBody.timeTo.split(':');
  const dateTimeEnd = dateTimeStart.clone().hour(timeTo[0]).minute(timeTo[1]);
  const usersIds = tools.getUsersFromRequest(pageReqBody);

  mutation.createEvent(global, {
    input: {
      title: pageReqBody.title,
      dateStart: dateTimeStart.toISOString(),
      dateEnd: dateTimeEnd.toISOString()
    },
    usersIds: usersIds,
    roomId: pageReqBody.roomId
  })
    .then(response => {
      data.eventCreatedtId = response.dataValues.id;
      getPage();
    })
    .catch((e) => {
      console.log('\ncreateEvent failed: ');
      console.log(e);
      getPage();
    });
}

// ------------------------------

function updateEvent () {
  const dateStart = moment(pageReqBody.daycode);
  const timeFrom = pageReqBody.timeFrom.split(':');
  const dateTimeStart = dateStart.hour(timeFrom[0]).minute(timeFrom[1]);
  const timeTo = pageReqBody.timeTo.split(':');
  const dateTimeEnd = dateTimeStart.clone().hours(timeTo[0]).minutes(timeTo[1]);

  const mutationsProms = [];

  // Update event title & time
  mutationsProms.push(
    mutation.updateEvent(global,
      {
        id: pageReqBody.itemid,
        input: {
          title: pageReqBody.title,
          dateStart: dateTimeStart.toISOString(),
          dateEnd: dateTimeEnd.toISOString()
        }
      }
    )
  );

  // Update event room
  mutationsProms.push(
    mutation.changeEventRoom(global,
      {
        id: pageReqBody.itemid,
        roomId: pageReqBody.roomId
      }
    )
  );

  Promise.all(mutationsProms)
    .then(response => {
      data.eventUpdatedtId = response[0].dataValues.id;
      getPage();
    })
    .catch((e) => {
      console.log('\nupdateEvent failed: ');
      console.log(e);
      getPage();
    });
}

// ------------------------------

function removeEvent () {
  mutation.removeEvent(
      global,
      { id: pageReqBody.itemid }
    )
    .then(response => {
      getPage();
    })
    .catch((e) => {
      getPage();
    });
}

// ------------------------------

function renderPage () {
  pageData.events = events.getPageData(data.events);
  data.popup = {};

  if (data.eventCreatedtId) {
    data.popup = {
      title: 'Встреча создана',
      event: pageData.events[data.eventCreatedtId],
      pageMod: 'page--event-popup',
      mod: 'created'
    };
  } else if (data.eventUpdatedtId) {
    data.popup = {
      title: 'Встреча изменена',
      event: pageData.events[data.eventUpdatedtId],
      pageMod: 'page--event-popup',
      mod: 'updated'
    };
  }

  pageResponse.render(
    'index',
    {
      event: data.event,
      days: tools.daysList,
      rooms: partials.roomsList,
      hours: config.hoursInDay,
      hoursNav: partials.hoursNav,
      sheduleDays: data.shedule,
      popupCalendar: partials.popupCalendar,
      pageData: JSON.stringify(pageData),
      popup: data.popup,
      pageMod: data.popup.pageMod,
      partials: {
        'symbols': 'components/_symbols',
        'page-header': 'components/_page-header',
        'shedule': 'components/_shedule',
        'days-nav': 'components/_days-nav',
        'popup--calendar': 'components/_popup--calendar',
        'popup--view-info': 'components/_popup--view-info',
        'popup--event-created': 'components/_popup--event-popup'
      }
    }
  );
}

// ------------------------------

module.exports.index = handleRequest;

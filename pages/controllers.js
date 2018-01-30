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
const users = require('./users');
const shedule = require('./shedule');
const pageData = {
  events: {}
};

const data = {};
const partials = {};
let pageResponse = null;
let pageReqBody = null;

// ------------------------------

function handleRequest (req, res) {
  pageResponse = res;
  pageReqBody = req.body;

  query.events()
    .then(response => {
      data.events = response;

      const matches = tools.findMatches(data.events, pageReqBody);

      if (pageReqBody.action === 'create') {
        if (matches.byDateRoom > 0) {
          // Room & date match
          console.log('Room & date match');
          getPage();
        } else {
          createEvent();
        }
      } else if (pageReqBody.action === 'remove' && matches.byId > 0) {
        removeEvent();
      } else if (pageReqBody.action === 'update') {
        updateEvent();
      }
      else {
        // Unhandled action
        getPage();
      }
    })
    .catch((error) => {
      console.log('\nPromises in handleRequest() failed:');
      console.log(error);
    });;
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

        renderPage ();
      })
    .catch((error) => {
      console.log('\nPromises in getPage() failed:');
      console.log(error);
    });
}

// ------------------------------

function createEvent () {
  console.log('\ncreateEvent()');
  if(!pageReqBody.title || pageReqBody.usersIds.length == 0 || !pageReqBody.RoomId) {
    // No data for event
    getPage ();
    return;
  }

  const dateTimeStart = moment(pageReqBody.daycode);
  const timeTo = pageReqBody.timeTo.split(':');
  const dateTimeEnd = dateTimeStart.clone().hours(timeTo[0]).minutes(timeTo[1]);
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
        getPage ();
      })
    .catch((e) => {
      console.log('\ncreateEvent failed: ');
      console.log(e);
    });
}

// ------------------------------

function updateEvent () {
  const dateTimeStart = moment(pageReqBody.daycode);
  const timeTo = pageReqBody.timeTo.split(':');
  const dateTimeEnd = dateTimeStart.clone().hours(timeTo[0]).minutes(timeTo[1]);
  const usersIds = tools.getUsersFromRequest(pageReqBody);

  mutation.updateEvent(global, {
    id: pageReqBody.itemid,
    input: {
      title: pageReqBody.title,
      dateStart: dateTimeStart.toISOString(),
      dateEnd: dateTimeEnd.toISOString()
    },
    usersIds: usersIds,
    roomId: pageReqBody.roomid
  })
    .then(response => {
      getPage ();
      })
    .catch((e) => {
      console.log('\nupdateEvent failed: ');
      console.log(e);
    });
}

// ------------------------------

function removeEvent () {
  mutation.removeEvent(
      global,
      { id: pageReqBody.itemid }
    )
    .then(response => {
        getPage ();
      })
    .catch((e) => {
      console.log('\nremoveEvent() failed');
      console.log(e);
      getPage ();
    });
}

// ------------------------------

function renderPage () {
  pageData.events = events.getPageData(data.events);

  pageResponse.render(
    'index',
    {
      days: tools.daysList,
      rooms: partials.roomsList,
      hours: config.hoursInDay,
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

module.exports.index = handleRequest;

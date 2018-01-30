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

function getPage (req, res) {
  pageResponse = res;
  pageReqBody = req.body;

  console.log('\n\n++ pageReqBody ++');
  console.log(pageReqBody);

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

        if (!pageReqBody.action) {
          renderPage();
          return;
        }

        handleRequest();
      })
    .catch((error) => {
      console.log('\nPromises in getPage() failed:');
      console.log(error);
    });
}

// ------------------------------

function handleRequest () {
  console.log('handleRequest');
  const matches = tools.findMatches(data.events, pageReqBody);

  if (pageReqBody.action === 'create') {
    // Dont check unique names
    // Check users in other events
    // console.log(matches.byDateUsers);
    if (matches.byDateUsers.length > 0) {
      const users = [];// getLoginsByIds(matches.byDateUsers);

      actionError = `Событие <b>«${pageReqBody.title}»</b> не было создано, потому что некоторые сотрудники <i>${users.join(', ')}</i> будут в это время на другой встрече`;

      queryEvents();
    } else if (matches.byDateRoom > 0) {
      actionError = `Событие <b>«${pageReqBody.title}»</b> не было создано, потому что до завершения этого события в этой переговорке начнётся другое`;

      queryEvents();
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
    renderPage();
  }
}

// ------------------------------

function createEvent () {
  console.log('\ncreateEvent()');
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
        // actionMessage = `Событие <b>«${response.dataValues.title}»</b> создано.`;
        queryEvents();
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
      // actionMessage = `Событие <b>«${response.dataValues.title}»</b> изменено.`;

      queryEvents();
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
        queryEvents();
      })
    .catch((e) => {
      console.log('\nremoveEvent() failed');
      console.log(e);
    });
}

// ------------------------------

function queryEvents () {
  console.log('queryEvents ()');
  query.events()
    .then(response => {
        data.events = response;
        data.shedule = shedule.getSheduleList({
          events: data.events,
          floors: data.floors,
          isHasItems: true
        });

        renderPage();
      })
    .catch((e) => {
      console.log('\nPromises in queryEvents() failed:');
      console.log(e);
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

module.exports.index = getPage;

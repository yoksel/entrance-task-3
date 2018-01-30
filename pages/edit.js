'use strict';

const resolvers = require('../graphql/resolvers')();
const query = resolvers.Query;
const moment = require('moment');
moment.locale('ru');

const tools = require('./tools');
const rooms = require('./rooms');
const users = require('./users');
const pageData = {};

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
  const eventId = req.query['event-id'];

  console.log('EDIT REQ.QUERY');
  console.log(req.query);

  const dataProms = [
    query.event(global, {id: eventId}),
    query.events(),
    query.users(),
    query.rooms()
  ];

  const partialsProms = [
    tools.getPopupCalendar(),
    users.getEventUserTmpl()
  ];

  Promise.all(dataProms)
    .then(response => {
        data.event = response[0];
        data.eventData = fillData(response[0]);
        data.events = response[1];
        data.users = response[2];
        data.rooms = response[3].sort(rooms.sortByFloor);

        return Promise.all(partialsProms);
      })
    .then(response => {
        partials.popupCalendar = response[0];
        partials.eventUserTmpl = response[1];

        renderPage();
      })
    .catch((error) => {
      console.log('\nPromises in getPage() failed:');
      console.log(error);
    });
}

// ------------------------------

function fillData (event) {
  const itemData = event.dataValues;
  const dateTime = moment(itemData.dateStart);
  const timeStart = dateTime.format('HH:mm');
  const timeEnd = moment(itemData.dateEnd).format('HH:mm');

  return {
    id: event.id,
    title: event.title,
    dayCode: dateTime.toISOString(),
    date: dateTime.format('D MMMM'),
    timeStart: timeStart,
    timeEnd: timeEnd,
    roomId: itemData.RoomId
  };
}

// ------------------------------

function renderPage () {
  pageData.users = users.getUsersData(data.users);
  const usersData = users.getEventUsers(data.users, data.event.users);
  const roomsData = rooms.fillRooms({
    title: 'Ваша переговорка',
    rooms: data.rooms,
    roomId: data.eventData.roomId
  });

  pageResponse.render(
    'edit',
    {
      event: data.eventData,
      monthes: tools.getMonthes,
      pageData: JSON.stringify(pageData),
      popupCalendar: partials.popupCalendar,
      users: usersData,
      eventUsers: usersData,
      eventUserTmpl: partials.eventUserTmpl,
      rooms: roomsData,
      partials: {
        'symbols': 'components/_symbols',
        'page-header': 'components/_page-header',
        'popup--remove-event': 'components/_popup--remove-event',
        'select-users': 'components/_select-users',
        'select-room': 'components/_select-room',
        'popup--users': 'components/_popup--users',
        'event-user': 'components/_event-user'
      }
    }
  );
}

// ------------------------------

module.exports.edit = getPage;

'use strict';

const resolvers = require('../graphql/resolvers')();
const query = resolvers.Query;
const moment = require('moment');
moment.locale('ru');

const tools = require('./tools');
const events = require('./events');
const rooms = require('./rooms');
const users = require('./users');
const shedule = require('./shedule');

const pageData = {};
const data = {};
const partials = {};
let pageResponse = null;
let pageQuery = null;

// ------------------------------

function getPage (req, res) {
  pageResponse = res;
  pageQuery = req.query;
  const eventId = req.query['event-id'];

  const dataProms = [
    query.event(global, {id: eventId}),
    query.events(),
    query.users(),
    query.rooms()
  ];

  const partialsProms = [
    tools.getPopupCalendar(),
    tools.getPageTmpl('_event-user'),
    tools.getPageTmpl('_select-room-item'),
  ];

  Promise.all(dataProms)
    .then(response => {
        data.event = response[0];
        data.eventData = fillData(response[0]);
        data.events = response[1];
        data.users = response[2];
        data.rooms = response[3].sort(rooms.sortByFloor);
        data.floors = rooms.getRoomsByFloors(data.rooms);

        data.shedule = shedule.getShedule({
          events: data.events,
          floors: data.floors,
          isHasItems: false
        });

        return Promise.all(partialsProms);
      })
    .then(response => {
        partials.popupCalendar = response[0];
        partials.eventUserTmpl = response[1];
        partials.eventRoomTmpl = response[2];

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
  pageData.events = events.getPageData(data.events);
  pageData.shedule = data.shedule;
  pageData.rooms = rooms.getPageData(data.rooms);

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
      eventUserTmpl: partials.eventUserTmpl,
      eventRoomTmpl: partials.eventRoomTmpl,
      rooms: roomsData,
      partials: {
        'symbols': 'components/_symbols',
        'page-header': 'components/_page-header',
        'popup--remove-event': 'components/_popup--remove-event',
        'select-users': 'components/_select-users',
        'select-room': 'components/_select-room',
        'popup--users': 'components/_popup--users',
        'event-user': 'components/_event-user',
        'select-room-item': 'components/_select-room-item',
        'select-datetime': 'components/_select-datetime'
      }
    }
  );
}

// ------------------------------

module.exports.edit = getPage;

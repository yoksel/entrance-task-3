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

  console.log('---- req.query');
  console.log();

  data.event = fillData();

  const dataProms = [
    query.events(),
    query.rooms(),
    query.users()
  ];

  const partialsProms = [
    tools.getPopupCalendar(),
    tools.getPageTmpl('_event-user'),
    tools.getPageTmpl('_select-room-item'),
  ];

  Promise.all(dataProms)
    .then(response => {
        data.events = response[0];
        data.rooms = response[1].sort(rooms.sortByFloor);
        data.floors = rooms.getRoomsByFloors(data.rooms);

        data.shedule = shedule.getShedule({
          events: data.events,
          floors: data.floors,
          isHasItems: false
        });
        data.users = response[2];

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

function fillData () {
  const dateTime = moment(pageQuery.dateTime);
  const timeStart = dateTime.format('HH:mm');
  const timeEnd = dateTime.clone().add(30, 'm').format('HH:mm');

  return {
    dayCode: dateTime.toISOString(),
    date: dateTime.format('D MMMM'),
    timeStart: timeStart,
    timeEnd: timeEnd
  };
}

// ------------------------------

function renderPage () {
  pageData.users = users.getUsersData(data.users);
  pageData.events = events.getPageData(data.events);
  pageData.shedule = data.shedule;
  pageData.rooms = rooms.getPageData(data.rooms);

  const usersData = users.getEventUsers(data.users);
  const roomsData = rooms.fillRooms({
    title: 'Рекомендованные переговорки',
    rooms: data.rooms,
    roomId: pageQuery.roomId
  });

  pageResponse.render(
    'create',
    {
      event: data.event,
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
        'select-room-item': 'components/_select-room-item'
      }
    }
  );
}

// ------------------------------

module.exports.create = getPage;

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

  data.eventData = fillData();

  const dataProms = [
    query.events(),
    query.rooms(),
    query.users()
  ];

  const partialsProms = [
    tools.getPopupCalendar(),
    tools.getPageTmpl('_event-user'),
    tools.getPageTmpl('_select-room-item'),
    tools.getPageTmpl('_select-room-swapitem')
  ];

  Promise.all(dataProms)
    .then(response => {
      data.events = response[0];
      data.rooms = response[1].sort(rooms.sortByFloor);
      data.floors = rooms.getRoomsByFloors(data.rooms);
      data.users = response[2];

      data.slots = shedule.getSlotsList({
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
      partials.eventSwapTmpl = response[3];

      renderPage();
    })
    .catch((error) => {
      console.log('\nPromises in getPage() failed:');
      console.log(error);
    });
}

// ------------------------------

function fillData () {
  let date = '';
  let dayCode = '';
  let dateTimeStart = '';
  let dateTimeStartIso = '';
  let dateTimeEnd = '';
  let dateTimeEndIso = '';
  let timeStart = '';
  let timeEnd = '';

  if (pageQuery.dateTime) {
    dateTimeStart = moment(pageQuery.dateTime);
    dateTimeStartIso = dateTimeStart.toISOString();
    dateTimeEnd = dateTimeStart.clone().add(30, 'm');
    dateTimeEndIso = dateTimeEnd.toISOString();

    date = dateTimeStart.format('D MMMM');
    dayCode = dateTimeStart.clone().hour(0).minute(0).second(0);
    dayCode = dayCode.toISOString();

    timeStart = dateTimeStart.format('HH:mm');
    timeEnd = dateTimeEnd.format('HH:mm');
  }

  return {
    dayCode: dayCode,
    dayKey: tools.getDayKey(dayCode),
    date: date,
    dateTimeStart: dateTimeStartIso,
    dateTimeEnd: dateTimeEndIso,
    timeStart: timeStart,
    timeEnd: timeEnd
  };
}

// ------------------------------

function renderPage () {
  pageData.users = users.getUsersData(data.users);
  pageData.events = events.getPageData(data.events);
  pageData.slots = data.slots;
  pageData.rooms = rooms.getPageData(data.rooms);
  let legendText = 'Рекомендованные переговорки';

  if (pageQuery.roomId) {
    legendText = 'Ваша переговорка';
  }

  const usersData = users.getEventUsers(data.users);
  const roomsData = rooms.fillRooms({
    title: legendText,
    rooms: data.rooms,
    roomId: pageQuery.roomId,
    slots: data.slots,
    event: data.eventData
  });

  pageResponse.render(
    'create',
    {
      event: data.eventData,
      actionId: tools.getRandomId(),
      monthes: tools.getMonthes,
      pageData: JSON.stringify(pageData),
      popupCalendar: partials.popupCalendar,
      users: usersData,
      eventUserTmpl: partials.eventUserTmpl,
      eventRoomTmpl: partials.eventRoomTmpl,
      eventSwapTmpl: partials.eventSwapTmpl,
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

module.exports.create = getPage;

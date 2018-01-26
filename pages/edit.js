const resolvers = require('../graphql/resolvers')();
const query = resolvers.Query;
const mutation = resolvers.Mutation;
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

  console.log('req.query');
  console.log(req.query);

  const dataProms = [
    query.event(global, {id: eventId}),
    query.rooms(),
    query.users()
  ];

  Promise.all(dataProms)
    .then(
      response => {
        data.event = response[0];
        data.eventData = fillData(response[0]);
        data.rooms = response[1].sort(tools.sortByFloor);
        data.users = response[2];
        data.users.light = users.getUsersList(data.users, data.event.users);

        pageData.users = users.getUsersData(data.users);

        const partialsProms = [
          tools.getPopupCalendar(),
          users.getEventUserTmpl()
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
        partials.popupCalendar = response[0];
        partials.eventUserTmpl = response[1];

        renderPage();
      },
      error => {
        console.log('\nPromises in getPage() failed:');
        console.log(error);
      }
    );
}

// ------------------------------

function fillData (event) {
  console.log('fillData in edit');

  const itemData = event.dataValues;
  const dateTime = moment(itemData.dateStart);
  const timeStart = dateTime.format('HH:mm');
  const timeEnd = moment(itemData.dateEnd).format('HH:mm');

  console.log('dateTime', dateTime);

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

function fillRooms() {

  console.log('fillRooms');
  const mods = ['rooms'];

  return {
    group: {
      title: 'Ваша переговорка',
      class: tools.addMods({
        class: 'form__group',
        mods: mods
      })
    },
    list: rooms.getRoomsData(data.rooms, data.eventData.roomId),
    mod: 'select-room--room-selected'
  };
}

// ------------------------------

function renderPage () {
  pageResponse.render(
    'edit',
    {
      event: data.eventData,
      monthes: tools.getMonthes,
      pageData: JSON.stringify(pageData),
      popupCalendar: partials.popupCalendar,
      users: data.users.light,
      eventUsers: users.getUsersList(data.event.users),
      eventUserTmpl: partials.eventUserTmpl,
      rooms: fillRooms(),
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

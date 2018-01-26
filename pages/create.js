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
let pageQuery = null;

// ------------------------------

function getPage (req, res) {
  pageResponse = res;
  pageReq = req;
  pageReqBody = req.body;
  pageQuery = req.query;

  console.log('---- req.query');
  console.log();

  data.event = fillData();

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
        data.users = response[2];
        data.users.light = users.getUsersList(data.users);

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

function fillData () {
  const dateTime = moment(pageQuery.dateTime);
  const timeStart = dateTime.format('HH:mm');
  const timeEnd = dateTime.clone().add(30, 'm').format('HH:mm');
  console.log(timeStart, timeEnd);

  return {
    dayCode: dateTime.toISOString(),
    date: dateTime.format('D MMMM'),
    timeStart: timeStart,
    timeEnd: timeEnd,
  };
}

// ------------------------------

function renderPage () {
  pageResponse.render(
    'create',
    {
      event: data.event,
      monthes: tools.getMonthes,
      pageData: JSON.stringify(pageData),
      popupCalendar: partials.popupCalendar,
      users: data.users.light,
      eventUserTmpl: partials.eventUserTmpl,
      rooms: {
        list: rooms.getRoomsData(data.rooms, pageQuery.roomId),
        mod: 'select-room--room-selected'
      },
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

module.exports.create = getPage;

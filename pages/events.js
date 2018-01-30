const tools = require('./tools');
const users = require('./users');

// ------------------------------

function getPageData(eventsData) {
  const events = {};

  eventsData.forEach((event) => {
    events[event.id] = {
      id: event.id,
      title: event.title,
      room: event.room.title,
      date: tools.prettyDate(event),
      dateSrc: {
        start: event.dateStart,
        end: event.dateEnd
      },
      users: users.getEventUsers(event.users)
    };
  });

  return events;
}

// ------------------------------

module.exports = {
  getPageData: getPageData,
};
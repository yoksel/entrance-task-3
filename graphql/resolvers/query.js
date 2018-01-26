const { models } = require('../../models');

module.exports = {
  event (root, { id }) {
    let event = null;

    return new Promise((resolve, reject) => {
      models.Event.findById(id)
        .then(response => {
          event = response;
          return Promise.all([event.getUsers(), event.getRoom()]);
        })
        .then(
          response => {
            event.users = response[0];
            event.room = response[1];
            resolve(event);
          },
          error => {
            console.log('Query.event failed\n');
            console.log(error);
          }
        );
    });
  },
  events (root, args, context) {
    let events = null;

    return new Promise((resolve, reject) => {
      models.Event.findAll(args, context)
        .then(response => {
          events = response;

          const promises = events.map(event => {
            return Promise.all([event.getUsers(), event.getRoom()]);
          });

          return Promise.all(promises);
        })
        .then(
          response => {
            events.forEach((event, i) => {
              event.users = response[i][0];
              event.room = response[i][1];
            });
            resolve(events);
          },
          error => {
            console.log('Query.events failed\n');
            console.log(error);
          }
        );
    });
  },
  user (root, { id }) {
    return models.User.findById(id);
  },
  users (root, args, context) {
    return models.User.findAll({}, context);
  },
  room (root, { id }) {
    return models.Room.findById(id);
  },
  rooms (root, args, context) {
    return models.Room.findAll(args, context);
  }
};

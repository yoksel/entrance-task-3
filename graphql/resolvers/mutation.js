const { models } = require('../../models');

module.exports = {
  // User
  createUser (root, { input }, context) {
    return models.User.create(input);
  },

  updateUser (root, { id, input }, context) {
    return models.User.findById(id)
            .then(user => {
              return user.update(input);
            });
  },

  removeUser (root, { id }, context) {
    return models.User.findById(id)
            .then(user => user.destroy());
  },

  // Room
  createRoom (root, { input }, context) {
    return models.Room.create(input);
  },

  updateRoom (root, { id, input }, context) {
    return models.Room.findById(id)
            .then(room => {
              return room.update(input);
            });
  },

  removeRoom (root, { id }, context) {
    return models.Room.findById(id)
            .then(room => room.destroy());
  },

  // Event
  createEvent (root, { input, usersIds, roomId }, context) {
    return models.Event.create(input)
            .then(event => {
              event.setRoom(roomId);

              return new Promise((resolve, reject) => {
                event.setUsers(usersIds)
                  .then(response => {
                    return Promise.all([event.getUsers(), event.getRoom()]);
                  })
                  .then(
                    response => {
                      event.users = response[0];
                      event.room = response[1];
                      resolve(event);
                    },
                    error => {
                      console.log('createEvent failed:\n');
                      console.log(error);
                    }
                  );
              });
            });
  },

  updateEvent (root, { id, input }, context) {
    return models.Event.findById(id)
            .then(event => {
              return new Promise((resolve, reject) => {
                event.update(input)
                  .then(response => {
                    return Promise.all([event.getUsers(), event.getRoom()]);
                  })
                  .then(
                    response => {
                      event.users = response[0];
                      event.room = response[1];
                      resolve(event);
                    },
                    error => {
                      console.log('updateEvent failed\n');
                      console.log(error);
                    }
                  );
              });
            });
  },

  addUserToEvent (root, { id, userId }, context) {
    return models.Event.findById(id)
            .then(event => {
              return new Promise((resolve, reject) => {
                event.addUser(userId)
                  .then(response => {
                    return Promise.all([event.getUsers(), event.getRoom()]);
                  })
                  .then(
                    response => {
                      event.users = response[0];
                      event.room = response[1];
                      resolve(event);
                    },
                    error => {
                      console.log('addUserToEvent failed\n');
                      console.log(error);
                    }
                  );
              });
            });
  },

  removeUserFromEvent (root, { id, userId }, context) {
    return models.Event.findById(id)
            .then(event => {
              return new Promise((resolve, reject) => {
                event.removeUser(userId)
                  .then(response => {
                    return Promise.all([event.getUsers(), event.getRoom()]);
                  })
                  .then(
                    response => {
                      event.users = response[0];
                      event.room = response[1];
                      resolve(event);
                    },
                    error => {
                      console.log('removeUserFromEvent failed\n');
                      console.log(error);
                    }
                  );
              });
            });
  },

  changeEventRoom (root, { id, roomId }, context) {
    return models.Event.findById(id)
            .then(event => {
              return new Promise((resolve, reject) => {
                event.setRoom(roomId)
                  .then(response => {
                    return Promise.all([event.getUsers(), event.getRoom()]);
                  })
                  .then(
                    response => {
                      event.users = response[0];
                      event.room = response[1];
                      resolve(event);
                    },
                    error => {
                      console.log('changeEventRoom failed\n');
                      console.log(error);
                    }
                  );
              });
            });
  },

  removeEvent (root, { id }, context) {
    return models.Event.findById(id)
            .then(event => event.destroy());
  }
};

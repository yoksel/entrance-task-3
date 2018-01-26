const path = require('path');
const fs = require('fs');

// ------------------------------

function getUsersData (data) {
  const usersData = {};

  data.forEach(item => {
    const itemData = item.dataValues;
    usersData[itemData.id] = itemData;
  });

  return usersData;
}

// ------------------------------

function getUsersList (data, checkedList) {
  const usersList = [];
  const checkedIds = getUsersIds(checkedList);

  data.forEach(item => {
    const itemData = item.dataValues;
    if (checkedIds && checkedIds.indexOf(itemData.id) > -1) {
      itemData.checked = 'checked';
    }
    usersList.push(itemData);
  });

  return usersList;
}

// ------------------------------

function getUsersIds (users) {
  let result = null;

  if (users) {
    result = users.map(user => {
      return user.dataValues.id;
    });
  }

  return result;
}

// ------------------------------

function getEventUsers (users) {
  const usersData = users.map(user => {
    const itemData = user.dataValues;

    return {
      id: itemData.id,
      login: itemData.login,
      homeFloor: itemData.homeFloor,
      avatarUrl: itemData.avatarUrl
    };
  });

  return usersData;
}

// ------------------------------

function getEventUserTmpl () {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, '../src/templates/components/_event-user.html'), 'utf8', (err, template) => {
      if (err) throw err;

      template = template.replace(/{/g, '[');
      template = template.replace(/}/g, ']');

      resolve(template);
    });
  });
}

// ------------------------------

module.exports = {
  getUsersData: getUsersData,
  getUsersList: getUsersList,
  getEventUsers: getEventUsers,
  getEventUserTmpl: getEventUserTmpl
};

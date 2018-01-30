'use strict';

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

function getUsersIds (users) {
  let result = null;

  if (users) {
    result = users.map(user => {
      return user.id;
    });
  }

  return result;
}

// ------------------------------

function getEventUsers (users, checkedList) {
  const checkedIds = getUsersIds(checkedList);

  const usersData = users.map(user => {
    const itemData = user.dataValues;
    itemData.avatar = `<img class="user__pic" alt="" src="${user.avatarUrl}">`;
    itemData.isChecked = '';

    if (checkedIds && checkedIds.indexOf(itemData.id) > -1) {
      itemData.isChecked = 'checked';
    }

    return itemData;
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
  getEventUsers: getEventUsers,
  getEventUserTmpl: getEventUserTmpl
};

const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
const moment = require('moment');
moment.locale('ru');

const eventsStep = 15;
const eventsStepsInHour = 60 / eventsStep;
const sheduleDaysMax = 10;

const now = new Date();
const year = now.getFullYear();
const todayObj = parseDate(now);
const daysList = getDaysList();
const startHour = 8;
const hoursInDay = 16;
const slotWidth = 100/(hoursInDay * eventsStepsInHour); // %
const hours = fillHours();

// ------------------------------

function fillHours () {
  const hours = [];

  for (let i = startHour; i < (startHour + hoursInDay); i++) {
    hours.push(i);
  }

  return hours;
}

// ------------------------------

function parseDate (date) {
  const newDate = moment(date);

  return {
    year: newDate.format('YYYY'),
    monthNum: newDate.format('MM'),
    month: newDate.format('MMMM'),
    weekDay: newDate.format('dddd'),
    dayNum: newDate.format('D'),
    dayKey: getDayKey(newDate),
    dayCode: newDate.format('DD/MM/YY'),
    hours: newDate.format('H'),
    mins: newDate.format('mm'),
    dateFormat: newDate.format('D MMMM'),
    timeFormat: newDate.format('HH[:]mm')
  };
}

// ------------------------------

// Input needs parsed date
function prettyDate (event) {
  const itemData = event.dataValues;
  const dateTime = {
    start: moment(itemData.dateStart),
    end: moment(itemData.dateEnd)
  };

  const dayStart = dateTime.start.format('D-M');
  const dayEnd = dateTime.start.format('D-M');
  const date = {
    start: dateTime.start.format('D MMMM'),
    end: dateTime.end.format('D MMMM'),
  };
  const time = {
    start: dateTime.start.format('HH[:]mm'),
    end: dateTime.end.format('HH[:]mm'),
  };

  if (dayStart === dayEnd) {
    const period = `${time.start}&mdash;${time.end}`;

    return `${date.start}, ${period}`;
  }
  else {
    return `${date.start},
    ${time.start}&mdash;${date.end}, ${time.end}`;
  }
}

// ------------------------------

function getDaysList () {
  const daysList = [];
  const relativeDays = [
    'Сегодня',
    'Завтра'
  ];

  for (let i = 0; i < sheduleDaysMax; i++) {
    const newDate = moment().add(i, 'd');
    const key = getDayKey(newDate);
    const code = newDate.format('YYYY-MM-DD');
    const date = newDate.format('D MMMM');
    let dateShort = newDate.format('D MMM');
    dateShort = dateShort.substr(0, dateShort.length - 1);
    const weekDay = relativeDays[i] ? relativeDays[i] : newDate.format('dddd');

    daysList.push({
      key: key,
      code: code,
      date: date,
      dateShort: dateShort,
      weekday: weekDay
    });
  }

  return daysList;
}

// ------------------------------

function getMonthes () {
  const MonthList = [];
  const monthesMax = 3;

  for (let m = 0; m < monthesMax; m++) {
    const firstDate = moment().add(m, 'M').date(1);
    const lastDate = firstDate.clone().add(1, 'M').subtract(1, 'd');
    const lastDay = lastDate.format('D');
    const month = firstDate.format('MM');

    let newMonthFirstWeekDay = firstDate.format('E') - 1;

    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const days = [];

    for (var e = 1; e <= newMonthFirstWeekDay; e++) {
      days.push({
        button: false,
        dayClass: 'calendar__day calendar__day--empty'
      });
    }

    for (var d = 0; d < lastDay; d++) {
      const dayDate = firstDate.clone().add(d, 'd');
      let dayClass = 'calendar__day';
      let buttonClass = 'calendar__button';
      let dayStyle = '';

      if (month === todayObj.monthNum) {
        if (d < todayObj.dayNum) {
          buttonClass += ' calendar__button--past';
        }
        else if (`${d}` === todayObj.dayNum) {
          buttonClass += ' calendar__button--today';
        }
      }

      days.push({
        day: dayDate.format('D'),
        dayClass: dayClass,
        dayStyle: dayStyle,
        dayCode: dayDate.format('YYYYMMD'),
        button: [
          buttonClass
        ]
      });
    }

    let monthClass = 'calendar__month';

    if (m === 0) {
      monthClass += ' calendar__month--current';
    }
    // selected

    MonthList.push({
      month: firstDate.format('MMMM'),
      monthClass: monthClass,
      year: firstDate.format('YYYY'),
      weekdays: weekdays,
      days: days,
      lastDay: lastDay
    });
  }

  return MonthList;
}

// ------------------------------

function getPopupCalendar () {
  const templatePath = '../src/templates/components/_popup--calendar.html';
  const view = {
    monthes: getMonthes
  };

  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, templatePath), 'utf8', (err, template) => {
      if (err) throw err;

      resolve(mustache.render(template, view));
    });
  });
}

// ------------------------------

function getDayKey (date) {
  const key = moment(date).locale('en').format('D-MMM');
  return key;
}

// ------------------------------

function getEmptySheduleForFloor (floorsObj, day) {
  const shedule = JSON.parse(JSON.stringify(floorsObj));

  for (let floorNum in shedule) {
    const floor = shedule[floorNum];

    for (let roomId in floor.rooms) {
      const room = floor.rooms[roomId];
      room.events = [];

      hours.forEach(hour => {
        room.events = room.events.concat(getEmptyEvents(day, hour, roomId));
      });
    }
  }

  return shedule;
}

// ------------------------------

function getEmptyEvents (day, hour, roomId) {
  const events = [];

  for (var i = 0; i < eventsStepsInHour; i++) {
    let mins = eventsStep * i;
    const dateTime = moment(day.code).hours(hour).minute(mins);
    const dateTimeStr = dateTime.toISOString();

    events.push({
      style: `style="flex-basis: ${slotWidth}%"`,
      hour: hour,
      mins: mins,
      event: {},
      buttonMod: 'button--blue',
      url: `./create?roomId=${roomId}&dateTime=${dateTimeStr}`
    });
  }

  return events;
}

// ------------------------------

function getEventDuration (itemData) {
  const start = itemData.dateStart;
  const end = itemData.dateEnd;
  let duration = end.getTime() - start.getTime();
  duration = duration / 60 / 1000;

  return duration;
}

// ------------------------------

function getTimeFromRequest (pageReqBody) {
  const dateTimeStart = moment(pageReqBody.daycode);
  const timeTo = pageReqBody.timeTo.split(':');
  const dateTimeEnd = dateTimeStart.clone().hours(timeTo[0]).minutes(timeTo[1]);

  return {
    start: dateTimeStart,
    end: dateTimeEnd
  };
}

// ------------------------------

function findMatches (items, pageReqBody) {
  const matches = {
    byId: 0,
    byName: 0,
    byDateRoom: 0,
    byDateUsers: []
  };

  const usersIds = getUsersFromRequest(pageReqBody);

  if (pageReqBody.action) {
    items.forEach(item => {
      const itemData = item.dataValues;

      if (pageReqBody.title && (pageReqBody.title === itemData.title)) {
        matches.byName++;
      }
      else if (pageReqBody.login && pageReqBody.login === itemData.login) {
        matches.byName++;
      }

      if (+pageReqBody.itemid === itemData.id) {
        matches.byId++;
      }

      // Event, need check room & users
      if (pageReqBody.timeFrom) {
        const itemStartTime = itemData.dateStart;
        const itemEndTime = itemData.dateEnd;
        const time = getTimeFromRequest(pageReqBody);
        const users = item.users;

        if ((time.start >= itemStartTime && time.start <= itemEndTime) ||
          (time.end >= itemStartTime && time.end <= itemEndTime)) {
          // Same date & time

          if (itemData.RoomId === +pageReqBody.roomId) {
            // Same room
            matches.byDateRoom++;
          } else {
            const eventUsersIds = {};

            users.forEach(user => {
              const userId = user.dataValues.id;
              eventUsersIds[userId] = userId;
            });

            const founded = usersIds.filter(item => {
              if (eventUsersIds[item] !== undefined) {
                return item;
              }
            });

            matches.byDateUsers = founded;

            if (founded.length > 0) {
              // Same users
            }
          }
        }
      }
    });
  }

  return matches;
}

// ------------------------------

function sortByFloor (a, b) {
  const aFloor = a.dataValues.floor;
  const bFloor = b.dataValues.floor;

  if (aFloor > bFloor) {
    return 1;
  } else if (aFloor < bFloor) {
    return -1;
  }

  return 0;
}

// ------------------------------

function getDaysNav () {
  const templatePath = '../src/templates/components/_days-nav.html';
  const view = {
    days: daysList
  };

  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, templatePath), 'utf8', (err, template) => {
      if (err) throw err;
      resolve(mustache.render(template, view));
    });
  });
}

// ------------------------------

function getHoursNav (data) {
  const hours = [];
  const start = data.start;
  const hoursInDay = data.hoursInDay;

  for (let i = start; i < (start + hoursInDay); i++) {
    let hour = i;
    if (i === start) {
      hour += ':00';
    }
    hours.push({hour: hour});
  }

  const templatePath = '../src/templates/components/_hours-nav.html';
  const view = {
    hours: hours
  };

  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, templatePath), 'utf8', (err, template) => {
      if (err) throw err;

      resolve(mustache.render(template, view));
    });
  });
}

// ------------------------------

function getSheduleDays (data) {
  const templatePath = '../src/templates/components/_shedule.html';
  const view = {
    sheduleDays: data,
    test: 'hello'
  };

  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, templatePath), 'utf8', (err, template) => {
      if (err) throw err;

      resolve(mustache.render(template, view));
    });
  });
}

// ------------------------------

function addMods (params) {
  let classList = [params.class];

  if (params.mods) {
    params.mods.forEach(mod => {
      classList.push(`${classList[0]}--${mod}`);
    });
  }

  if (params.isCurrent) {
    classList.push(`${classList[0]}--current`);
  }
  if (params.mix) {
    params.mix.forEach(mix => {
      classList.push(mix);
    });
  }

  return classList.join(' ');
}

// ------------------------------

function getUsersFromRequest(pageReqBody) {
  let usersIds = [];

  if (!pageReqBody.usersIds) {
    return usersIds;
  }

  if (typeof pageReqBody.usersIds === 'string'){
    usersIds = [+pageReqBody.usersIds];
  }
  else {
    pageReqBody.usersIds.map(userId => {
      return +userId;
    });
  }

  return usersIds;
}

// ------------------------------

module.exports = {
  addMods: addMods,
  daysList: daysList,
  eventsStep: eventsStep,
  eventsStepsInHour: eventsStepsInHour,
  findMatches: findMatches,
  getDayKey: getDayKey,
  getDaysNav: getDaysNav,
  getEmptySheduleForFloor: getEmptySheduleForFloor,
  getEventDuration: getEventDuration,
  getHoursNav: getHoursNav,
  getMonthes: getMonthes,
  getPopupCalendar: getPopupCalendar,
  getTimeFromRequest: getTimeFromRequest,
  getSheduleDays: getSheduleDays,
  getUsersFromRequest: getUsersFromRequest,
  hoursInDay: hoursInDay,
  prettyDate: prettyDate,
  parseDate: parseDate,
  slotWidth: slotWidth,
  sortByFloor: sortByFloor,
  startHour: startHour,
  todayDayKey: getDayKey(now),
};

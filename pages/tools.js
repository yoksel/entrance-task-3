'use strict';

const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
const moment = require('moment');
moment.locale('ru');
const config = require('./config');

const now = new Date();
const daysList = getDaysList();

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
    hours: newDate.format('HH'),
    mins: newDate.format('mm'),
    dateFormat: newDate.format('D MMMM'),
    timeFormat: newDate.format('HH[:]mm')
  };
}

// ------------------------------

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
    end: dateTime.end.format('D MMMM')
  };
  const time = {
    start: dateTime.start.format('HH[:]mm'),
    end: dateTime.end.format('HH[:]mm')
  };

  if (dayStart === dayEnd) {
    const period = `${time.start}&mdash;${time.end}`;

    return `${date.start}, ${period}`;
  } else {
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

  for (let i = 0; i < config.sheduleDaysMax; i++) {
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
  const todayObj = parseDate(now);

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
      let dayDate = firstDate.clone().add(d, 'd');
      dayDate = dayDate.hour(0).minute(0).second(0).millisecond(0);
      let dayClass = 'calendar__day';
      let buttonClass = 'calendar__button';
      let dayStyle = '';
      const day = dayDate.format('D');

      if (month === todayObj.monthNum) {
        if (day < todayObj.dayNum) {
          buttonClass += ' calendar__button--past';
        } else if (day === todayObj.dayNum) {
          buttonClass += ' calendar__button--today';
        }
      }

      days.push({
        day: dayDate.format('D'),
        dayClass: dayClass,
        dayStyle: dayStyle,
        dayCode: dayDate.toISOString(),
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

function getDayKey (date) {
  const key = moment(date).locale('en').format('D-MMM');
  return key;
}

function getDayCode (date) {
  const code = moment(date).format('YYYY-MM-DD');
  return code;
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

function getPopupCalendar () {
  const templatePath = '../src/templates/components/_popup--calendar.html';
  const view = {
    monthes: getMonthes()
  };

  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, templatePath), 'utf8', (err, template) => {
      if (err) throw err;

      resolve(mustache.render(template, view));
    });
  });
}

// ------------------------------

function findMatches (items, pageReqBody) {
  const matches = {
    byId: 0,
    byName: 0,
    byDateRoom: 0
  };

  if (pageReqBody.action) {
    items.forEach(item => {
      const itemData = item.dataValues;

      if (pageReqBody.login && pageReqBody.login === itemData.login) {
        matches.byName++;
      }

      if (+pageReqBody.itemid === itemData.id) {
        matches.byId++;
      }

      // Event, need check room
      if (pageReqBody.timeFrom) {
        const itemStartDateTime = moment(itemData.dateStart);
        const itemEndDateTime = moment(itemData.dateEnd);
        const reqEventTime = getTimeFromRequest(pageReqBody);

        // Same room
        if (itemData.RoomId === +pageReqBody.roomId) {

          if ((reqEventTime.start >= itemStartDateTime && reqEventTime.start <= itemEndDateTime) ||
            (reqEventTime.end >= itemStartDateTime && reqEventTime.end <= itemEndDateTime)) {

            // Same date & time
            matches.byDateRoom++;
          }
        }
      }
    });
  }

  return matches;
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

function getHoursNav () {
  const hours = [];
  const start = config.startHour;
  const hoursInDay = config.hoursInDay;

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
    sheduleDays: data
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

function getUsersFromRequest (pageReqBody) {
  let usersIds = [];

  if (!pageReqBody.usersIds) {
    return usersIds;
  }

  if (typeof pageReqBody.usersIds === 'string') {
    usersIds = [+pageReqBody.usersIds];
  } else {
    usersIds = pageReqBody.usersIds.map(userId => {
      return +userId;
    });
  }

  return usersIds;
}

// ------------------------------

function getPageTmpl (tmpl) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, `../src/templates/components/${tmpl}.html`), 'utf8', (err, template) => {
      if (err) throw err;

      template = template.replace(/{/g, '[');
      template = template.replace(/}/g, ']');

      resolve(template);
    });
  });
}

// ------------------------------

module.exports = {
  addMods: addMods,
  daysList: daysList,
  findMatches: findMatches,
  getDayKey: getDayKey,
  getDayCode: getDayCode,
  getDaysNav: getDaysNav,
  getEventDuration: getEventDuration,
  getHoursNav: getHoursNav,
  getMonthes: getMonthes,
  getPageTmpl: getPageTmpl,
  getPopupCalendar: getPopupCalendar,
  getTimeFromRequest: getTimeFromRequest,
  getSheduleDays: getSheduleDays,
  getUsersFromRequest: getUsersFromRequest,
  prettyDate: prettyDate,
  parseDate: parseDate,
  todayDayKey: getDayKey(now)
};

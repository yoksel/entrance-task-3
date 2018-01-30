'use strict';

// ------------------------------
// SET TIME
// ------------------------------

(function () {
  const currenTimeMarker = {
    elem: document.querySelector('.current-time'),
    classHidden: 'current-time--hidden'
  };

  const hoursItems = document.querySelectorAll('.hours-nav__item');
  hoursItems.slice = [].slice;

  function setTime () {
    const marker = document.querySelector('.current-time');

    if (!marker) {
      return;
    }

    const value = currenTimeMarker.elem.querySelector('.current-time__value');
    const now = new Date();
    const nowHhours = now.getHours();
    let nowMins = now.getMinutes();
    const hoursStart = 8;
    const hoursEnd = 24;
    const workHoursInDay = hoursEnd - hoursStart;
    const hourPosInDay = nowHhours - hoursStart;

    if (nowHhours < hoursStart || nowHhours >= hoursEnd) {
      currenTimeMarker.elem.classList.add('current-time--hidden');
      return;
    } else {
      currenTimeMarker.elem.classList.remove('current-time--hidden');
    }

    const offset = (hourPosInDay + nowMins / 60) / workHoursInDay * 100;

    if (nowMins < 10) {
      nowMins = `0${nowMins}`;
    }
    value.innerHTML = `${nowHhours}:${nowMins}`;
    currenTimeMarker.elem.style.marginLeft = `${offset}%`;

    fadePastHours(hourPosInDay);
  }

  function fadePastHours (hourPosInDay) {
    const pastHours = hoursItems.slice(0, hourPosInDay);

    pastHours.forEach(item => {
      item.classList.add('hours-nav__item--past');
    });
  }

  setTime();

  setInterval(setTime, 1000 * 60);
}());

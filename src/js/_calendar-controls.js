'use strict';

/* global closePopups */

// ------------------------------
// CALENDAR CONTROLS
// ------------------------------

(function (window) {
  const calendarControls = document.querySelectorAll('.calendar-control');
  const calendarPopup = document.querySelector('.popup--calendar');

  calendarControls.forEach(control => {
    control.addEventListener('click', (event) => {
      event.stopPropagation();
      closePopups(calendarPopup);
      calendarPopup.classList.toggle('popup--opened');
    });
  });
}(window));

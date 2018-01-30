'use strict';

/* global closePopups, moment */

// ------------------------------
// SELECT DATE
// ------------------------------

(function () {
  const SelectDate = function (elem) {
    const buttons = elem.querySelectorAll('.calendar__button');
    this.input = elem.querySelector('.select-datetime__input');
    this.dayCodeInput = elem.querySelector('.select-datetime__daycode');
    this.timeFromInput = elem.querySelector('.select-datetime__timefrom');
    this.timeToInput = elem.querySelector('.select-datetime__timeto');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.setDate(button.value);
      });
    });

    this.timeFromInput.addEventListener('input', () => {
      console.log(this.timeFromInput.value);
    });
    this.timeToInput.addEventListener('input', () => {
      console.log(this.timeToInput.value);
    });
  };

  SelectDate.prototype.setDate = function (date) {
    moment.locale('ru');
    this.dayCodeInput.value = date;
    const dateShow = moment(date).format('D MMMM');
    this.input.value = dateShow;
    closePopups();
  };

  const selectDates = document.querySelectorAll('.select-datetime');

  selectDates.forEach(item => {
    const selectDate = new SelectDate(item);
  });
}());

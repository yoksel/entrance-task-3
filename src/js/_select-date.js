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
    this.calendarPopup = elem.querySelector('.popup--calendar');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.setDate(button.value);
      });
    });

    this.timeFromInput.addEventListener('input', () => {
      const date = moment(this.dayCodeInput.value);
      const timeSet = this.timeFromInput.value.split(':');
      const newDate = date.hour(+timeSet[0]).minute(+timeSet[1]);
      this.dayCodeInput.value = newDate;
    });

    this.timeToInput.addEventListener('input', () => {
      console.log(this.timeToInput.value);
    });

    this.input.addEventListener('click', (event) => {
      this.openPopup(event);
      this.input.classList.toggle('form__input--calendar-opened');
    });
  };

  SelectDate.prototype.setDate = function (date) {
    moment.locale('ru');
    this.dayCodeInput.value = date;
    const dateShow = moment(date).format('D MMMM');
    this.input.value = dateShow;
    closePopups();
  };

  SelectDate.prototype.openPopup = function (event) {
    event.stopPropagation();
    closePopups(this.calendarPopup);
    console.log(this.calendarPopup);
    this.calendarPopup.classList.toggle('popup--opened');
  };

  const selectDates = document.querySelectorAll('.select-datetime');

  selectDates.forEach(item => {
    const selectDate = new SelectDate(item);
  });
}());

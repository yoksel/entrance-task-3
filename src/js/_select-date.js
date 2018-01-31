'use strict';

/* global closePopups, moment */

// ------------------------------
// SELECT DATE
// ------------------------------

(function (window) {
  const SelectDate = function (elem) {
    const buttons = elem.querySelectorAll('.calendar__button');
    this.input = elem.querySelector('.select-datetime__input');
    this.dayCodeInput = elem.querySelector('.select-datetime__daycode');
    this.period = elem.querySelector('.form__period');
    this.timeFromInput = elem.querySelector('.select-datetime__time--from');
    this.timeToInput = elem.querySelector('.select-datetime__time--to');
    this.calendarPopup = elem.querySelector('.popup--calendar');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.setDate(button.value);
      });
    });

    this.timeFromInput.addEventListener('input', () => {
      const newDate = this.getDateFromTime(this.timeFromInput.value);
      this.dayCodeInput.value = newDate.toISOString();

      this.validateTime();
    });

    this.timeToInput.addEventListener('input', () => {
      this.validateTime();
    });

    this.input.addEventListener('click', (event) => {
      this.openPopup(event);
      this.input.classList.toggle('form__input--calendar-opened');
    });
  };

  // ------------------------------

  SelectDate.prototype.getDateFromTime = function (timeInputValue) {
    const timeSrc = this.dayCodeInput.value;
    let date = moment(timeSrc);

    if (timeSrc === '') {
      // Make no empty time for time validation while date is empty
      date = moment();
    }
    const timeSet = timeInputValue.split(':');
    const newDate = date.hour(+timeSet[0]).minute(+timeSet[1]);

    return newDate;
  };

  // ------------------------------

  SelectDate.prototype.setDate = function (date) {
    moment.locale('ru');
    this.dayCodeInput.value = date;

    const dateShow = moment(date).format('D MMMM');
    this.input.value = dateShow;

    selectUser.checkUsers();
    closePopups();
  };

  // ------------------------------

  SelectDate.prototype.getFormDate = function () {
    const timeFrom = this.getDateFromTime(this.timeFromInput.value).toISOString();
    const timeTo = this.getDateFromTime(this.timeToInput.value).toISOString();

    return {
      start: timeFrom,
      end: timeTo
    };
  };

  // ------------------------------

  SelectDate.prototype.validateTime = function () {
    const timeFrom = this.getDateFromTime(this.timeFromInput.value).toISOString();
    const timeTo = this.getDateFromTime(this.timeToInput.value).toISOString();

    if (this.timeFromInput.value && this.timeToInput.value === '') {
      this.period.classList.remove('form__period--not-valid');
      return;
    }

    if (timeFrom > timeTo) {
      this.period.classList.add('form__period--not-valid');
    } else {
      this.period.classList.remove('form__period--not-valid');
    }
  };

  // ------------------------------

  SelectDate.prototype.openPopup = function (event) {
    event.stopPropagation();
    closePopups(this.calendarPopup);
    this.calendarPopup.classList.toggle('popup--opened');
  };

  // ------------------------------

  const selectDateElem = document.querySelector('.select-datetime');

  if(selectDateElem) {
    const selectDate = new SelectDate(selectDateElem);
    window.selectDate = selectDate;
  }


}(window));

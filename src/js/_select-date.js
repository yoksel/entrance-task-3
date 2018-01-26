/* global closePopups, moment */

// ------------------------------
// SELECT DATE
// ------------------------------

(function () {
  const SelectDate = function(elem) {
    console.dir(elem);

    const buttons = elem.querySelectorAll('.calendar__button');
    this.input = elem.querySelector('.select-date__input');
    this.dayCodeInput = elem.querySelector('.select-date__daycode');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.setDate(button.value);
      })
    });
  }

  SelectDate.prototype.setDate = function(date) {
    moment.locale('ru');
    this.dayCodeInput.value = date;
    const dateShow = moment(date).format('D MMMM');
    this.input.value = dateShow;
    closePopups();
  };

  const selectDates = document.querySelectorAll('.select-date');

  selectDates.forEach(item => {
    const selectDate = new SelectDate(item);
  })
}());

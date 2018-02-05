'use strict';

/* global closePopups, getTemplate, moment, Mustache, pageData, selectDate, updateRecommendation */

// ------------------------------
// SELECT USERS
// ------------------------------

(function (window) {
  const SelectUser = function (elem) {
    this.elem = elem;
    this.usersPopup = elem.querySelector('.popup--users');
    this.usersControl = elem.querySelector('.users-control');
    const textInput = elem.querySelector('.select-users__input--text');
    this.resultsElem = elem.querySelector('.select-users__results');
    this.checkboxInputs = this.elem.querySelectorAll('.select-users__input--checkbox');
    const eventUserTmplElem = document.querySelector('.templates .select-users__result');
    this.form = document.querySelector('.form--event');
    this.eventUserTmpl = getTemplate(eventUserTmplElem.outerHTML);
    this.classHighlighted = {
      input: 'select-users__label--highlighted',
      control: 'select-users__result--highlighted',
      busy: 'select-users__results--busy'
    };
    this.busyUsers = [];

    this.checkUsers();

    this.usersControl.addEventListener('click', (event) => {
      this.openPopup(event);
    });

    textInput.addEventListener('click', (event) => {
      this.openPopup(event);
    });

    this.resultsElem.addEventListener('click', (event) => {
      this.uncheckUser(event.target);
    });

    this.checkboxInputs.forEach(input => {
      input.addEventListener('change', (event) => {
        this.toggleUser(input);

        updateRecommendation();
      });
    });
  };

  // ------------------------------

  SelectUser.prototype.checkUsers = function () {
    const date = selectDate.getFormDate();
    const dateStart = moment(date.start);
    const dateStartIso = dateStart.toISOString();
    const dateEnd = moment(date.end);
    const dateEndIso = dateEnd.toISOString();
    const dayKey = dateStart.locale('en').format('D-MMM');
    const slots = pageData.slots[dayKey];
    const eventIdElem = this.form.querySelector('.form__itemid');
    const eventId = eventIdElem ? eventIdElem.value : null;
    const usersList = Object.values(pageData.users);
    let foundedUsers = [];

    if (!slots) {
      // Past or far future events
      return;
    }

    const usersIds = usersList.map(user => {
      return user.id;
    });

    slots.forEach(slot => {
      if (slot.event && slot.event.id !== +eventId) {
        if ((dateStartIso <= slot.start && dateEndIso >= slot.start && dateEndIso <= slot.end) ||
            (dateStartIso >= slot.start && dateStartIso <= slot.end && dateEndIso >= slot.end)) {
          const usersList = Object.values(slot.users);

          const filtered = usersList.filter(user => {
            if (usersIds.indexOf(user.id) >= 0) {
              return user;
            }
          });
          foundedUsers = foundedUsers.concat(filtered);
        }
      }
    });

    this.busyUsers = foundedUsers.map(user => {
      return user.id;
    });

    this.highlightUsers();
  };

  // ------------------------------

  SelectUser.prototype.togglePlaceholder = function () {
    const results = this.elem.querySelectorAll('.select-users__result');

    if (results.length > 0) {
      this.resultsElem.classList.remove('select-users__results--empty');
    } else {
      this.resultsElem.classList.add('select-users__results--empty');
    }
  };

  // ------------------------------

  SelectUser.prototype.openPopup = function (event) {
    event.stopPropagation();
    closePopups(this.usersPopup);
    this.usersPopup.classList.toggle('popup--opened');
    this.usersControl.classList.toggle('users-control--opened');
  };

  // ------------------------------

  SelectUser.prototype.uncheckUser = function (resultElem) {
    const id = resultElem.value;
    const target = this.elem.querySelector(`#user--${id}`);

    if (target.checked) {
      target.checked = false;
    }

    resultElem.remove();
    this.togglePlaceholder();
    this.checkUsers();
    updateRecommendation();
  };

  // ------------------------------

  SelectUser.prototype.removeResult = function (id) {
    const target = this.elem.querySelector(`.select-users__result--${id}`);

    if (target) {
      target.remove();
    }

    this.checkUsers();
    closePopups();
  };

  // ------------------------------

  SelectUser.prototype.addResult = function (id) {
    const data = pageData.users[id];
    Mustache.parse(this.eventUserTmpl);
    const rendered = Mustache.render(this.eventUserTmpl, data);

    this.resultsElem.innerHTML += rendered;
    this.checkUsers();
    closePopups();
  };

  // ------------------------------

  SelectUser.prototype.toggleUser = function (input) {
    const id = input.value;
    const isChecked = input.checked;

    if (isChecked) {
      this.addResult(id);
    } else {
      this.removeResult(id);
    }

    this.togglePlaceholder();
  };

  // ------------------------------

  SelectUser.prototype.highlightUsers = function () {
    const results = this.elem.querySelectorAll('.select-users__result');
    const highlightInput = this.classHighlighted.input;
    const highlightControl = this.classHighlighted.control;
    const highlightResults = this.classHighlighted.busy;

    // Users in popup
    this.checkboxInputs.forEach(input => {
      const label = input.labels[0];

      if (this.busyUsers.indexOf(+input.value) >= 0) {
        if (!input.checked) {
          input.disabled = true;
        }
        label.classList.add(highlightInput);
      } else {
        input.disabled = false;
        label.classList.remove(highlightInput);
      }
    });

    // Users select results
    let busyInResults = 0;
    results.forEach(result => {
      if (this.busyUsers.indexOf(+result.value) >= 0) {
        result.classList.add(highlightControl);
        busyInResults++;
      } else {
        result.classList.remove(highlightControl);
      }
    });

    if (busyInResults > 0) {
      this.resultsElem.classList.add(highlightResults);
    } else {
      this.resultsElem.classList.remove(highlightResults);
    }
  };

  // ------------------------------

  const selectUserElem = document.querySelector('.select-users');

  if (selectUserElem) {
    const selectUser = new SelectUser(selectUserElem);
    window.selectUser = selectUser;
  }
}(window));

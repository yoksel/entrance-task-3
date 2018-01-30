'use strict';

/* global closePopups, pageData, Mustache, getTemplate, updateRecommendation */

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
    this.eventUserTmpl = getTemplate(eventUserTmplElem.outerHTML);
    this.classHighlighted = {
      input: 'select-users__label--highlighted',
      control: 'select-users__result--highlighted'
    };

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

  SelectUser.prototype.togglePlaceholder = function () {
    const results = this.elem.querySelectorAll('.select-users__result');

    if (results.length > 0) {
      this.resultsElem.classList.remove('select-users__results--empty');
    } else {
      this.resultsElem.classList.add('select-users__results--empty');
    }
  };

  SelectUser.prototype.openPopup = function (event) {
    event.stopPropagation();
    closePopups(this.usersPopup);
    this.usersPopup.classList.toggle('popup--opened');
    this.usersControl.classList.toggle('users-control--opened');
  };

  SelectUser.prototype.uncheckUser = function (resultElem) {
    const id = resultElem.value;
    const target = this.elem.querySelector(`#user--${id}`);

    if (target.checked) {
      target.checked = false;
    }

    resultElem.remove();
    this.togglePlaceholder();
    updateRecommendation();
  };

  SelectUser.prototype.removeResult = function (id) {
    const target = this.elem.querySelector(`.select-users__result--${id}`);

    if (target) {
      target.remove();
    }

    closePopups();
  };

  SelectUser.prototype.addResult = function (id) {
    const data = pageData.users[id];
    Mustache.parse(this.eventUserTmpl);
    const rendered = Mustache.render(this.eventUserTmpl, data);

    this.resultsElem.innerHTML += rendered;
    closePopups();
  };

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

  SelectUser.prototype.highlightUsers = function (users) {
    const results = this.elem.querySelectorAll('.select-users__result');
    console.log('highlightUsers()');
    console.log(users);
    const highlightInput = this.classHighlighted.input;
    const highlightControl = this.classHighlighted.control;

    this.checkboxInputs.forEach(input => {
      const label = input.labels[0];
      // console.log(label);
      console.log(input.value);
      if(users.indexOf(+input.value) >= 0) {
        label.classList.add(highlightInput);
        console.log('+');
      }
      else {
        label.classList.remove(highlightInput);
        console.log('-');
      }
    });


    results.forEach(result => {
      console.log(result.value);
      if(users.indexOf(+result.value) >= 0) {
        result.classList.add(highlightControl);
        console.log('+');
      }
      else {
        result.classList.remove(highlightControl);
        console.log('-');
      }
    });

    console.log('highlightUsers', users);
    console.dir(this.checkboxInputs[0]);
  }

  const selectUserElem = document.querySelector('.select-users');

  if (selectUserElem) {
    const selectUser = new SelectUser(selectUserElem);
    window.selectUser = selectUser;
  }

}(window));

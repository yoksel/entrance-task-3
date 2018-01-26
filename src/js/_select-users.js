/* global closePopups, pageData, Mustache, getTemplate */
// ------------------------------
// SELECT USERS
// ------------------------------

(function () {
  const SelectUser = function (elem) {
    this.elem = elem;
    this.usersPopup = elem.querySelector('.popup--users');
    this.usersControl = elem.querySelector('.users-control');
    const textInput = elem.querySelector('.select-users__input--text');
    this.resultsElem = elem.querySelector('.select-users__results');
    const checkboxLabels = elem.querySelectorAll('.select-users__label');
    const checkboxInputs = elem.querySelectorAll('.select-users__input--checkbox');
    const eventUserTmplElem = document.querySelector('.templates .select-users__result');
    this.eventUserTmpl = getTemplate(eventUserTmplElem.outerHTML);

    this.usersControl.addEventListener('click', (event) => {
      this.openPopup(event);
    });

    textInput.addEventListener('click', (event) => {
      this.openPopup(event);
    });

    this.resultsElem.addEventListener('click', (event) => {
      this.uncheckUser(event.target);
    });

    checkboxLabels.forEach(label => {
      label.addEventListener('click', (event) => {
        event.stopPropagation();
        this.toggleUser(label);
      });
    });
  };

  SelectUser.prototype.togglePlaceholder = function (event) {
    const results = this.elem.querySelectorAll('.select-users__result');

    if (results.length > 0) {
      this.resultsElem.classList.remove('select-users__results--empty');
    }
    else {
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
    var rendered = Mustache.render(this.eventUserTmpl, data);

    this.resultsElem.innerHTML += rendered;
    closePopups();
  };

  SelectUser.prototype.toggleUser = function (label) {
    const id = label.dataset.id;
    const isChecked = !label.control.checked;

    if (isChecked) {
      this.addResult(id);
    } else {
      this.removeResult(id);
    }

    this.togglePlaceholder();
  };

  const selectUsers = document.querySelectorAll('.select-users');

  selectUsers.forEach(item => {
    const selectUser = new SelectUser(item);
  });
}());

'use strict';

/* global getPlural, closePopups, getTemplate, pageData, Mustache */

// ------------------------------
// ACTIONS FOR SHOW EVENT BUTTON
// ------------------------------

(function () {
  const ShowEventButton = function (elem) {
    this.elem = elem;
    this.popup = {
      elem: document.querySelector('.popup--view-info'),
      classOpened: 'popup--opened',
      classRotated: 'popup--rotated'
    };
    this.popup.closePopup = function () {
      this.popup.elem.classList.remove(this.popup.classOpened);
    };
    this.popup.content = this.popup.elem.querySelector('.popup__content');
    this.arrow = this.popup.elem.querySelector('.popup__arrow');

    this.tmpl = getTemplate(this.popup.content.innerHTML);
    this.data = this.collectData();

    elem.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closePopups();
      this.openPopup();
    });
  };

  ShowEventButton.prototype.openPopup = function () {
    this.fillPopup();
    this.setPopupPosition();
  };

  ShowEventButton.prototype.collectData = function () {
    const eventId = this.elem.dataset.eventId;
    const data = pageData.events[eventId];
    const usersCount = data.users.length - 1;
    const usersForms = 'участник|участника|участников';
    const usersForm = getPlural(usersCount, usersForms);
    data.url = this.elem.href;

    data.users = {
      login: data.users[0].login,
      avatar: data.users[0].avatar,
      hasCount: !!usersCount,
      count: `${usersCount} ${usersForm}`
    };

    return data;
  };

  ShowEventButton.prototype.fillPopup = function () {
    Mustache.parse(this.tmpl);
    var rendered = Mustache.render(this.tmpl, this.data);

    this.popup.content.innerHTML = rendered;
  };

  ShowEventButton.prototype.setPopupPosition = function () {
    const slotCoords = this.elem.getBoundingClientRect();
    this.x = slotCoords.x + slotCoords.width / 2;
    this.y = slotCoords.y + slotCoords.height / 2;
    this.popup.elem.style.visibility = 'hidden';
    this.popup.elem.style.display = 'block';

    const left = this.checkXPopupPosition();
    const top = this.checkYPopupPosition();

    this.popup.elem.style.top = `${top}px`;
    this.popup.elem.style.left = `${left}px`;
    this.popup.elem.style.visibility = 'visible';
    this.popup.elem.style.display = '';
    this.popup.elem.classList.add(this.popup.classOpened);
  };

  ShowEventButton.prototype.checkXPopupPosition = function () {
    const popupCoords = this.popup.elem.getBoundingClientRect();
    const popupHalfWidth = popupCoords.width / 2;
    const maxArrowOffset = popupHalfWidth - 15;

    let left = this.x - popupHalfWidth;
    const overflowRight = (this.x + popupHalfWidth) - window.innerWidth;

    if (overflowRight > 0) {
      left -= overflowRight;
      let popupLeft = Math.abs(overflowRight);
      if (popupLeft >= maxArrowOffset) {
        popupLeft = maxArrowOffset;
      }
      this.arrow.style.left = `${popupLeft}px`;
    } else if (left < 0) {
      let popupRight = Math.abs(left);
      if (popupRight >= maxArrowOffset) {
        popupRight = maxArrowOffset;
      }
      this.arrow.style.right = `${popupRight}px`;
      left = 0;
    }

    return left;
  };

  ShowEventButton.prototype.checkYPopupPosition = function () {
    const popupCoords = this.popup.elem.getBoundingClientRect();

    const popupHeight = popupCoords.height;

    let top = this.y;
    const overflowBottom = (this.y + popupHeight) - window.innerHeight;

    if (overflowBottom > 0) {
      top -= popupHeight;
      this.popup.elem.classList.add(this.popup.classRotated);
    } else if (top < 0) {
      top = 0;
    } else {
      this.popup.elem.classList.remove(this.popup.classRotated);
    }

    return top;
  };

  const showEventButtons = document.querySelectorAll('.button-show-event');
  showEventButtons.forEach(item => {
    const showEventButton = new ShowEventButton(item);
  });
}());

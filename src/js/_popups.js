'use strict';

// ------------------------------
// POPUPS
// ------------------------------

(function (window) {
  const throttle = window.throttle;

  function closePopups (elem) {
    const popups = document.querySelectorAll('.popup');

    popups.forEach(popup => {
      if (popup !== elem) {
        popup.classList.remove('popup--opened');
      }
    });
  }

  window.closePopups = closePopups;

  window.addEventListener('click', () => {
    closePopups();
  });

  const popups = document.querySelectorAll('.popup');

  popups.forEach(popup => {
    popup.addEventListener('click', event => {
      event.stopPropagation();
    });
  });

  // ------------------------------

  const popupViewInfo = {
    elem: document.querySelector('.popup--view-info'),
    classOpened: 'popup--opened',
    classRotated: 'popup--rotated',
    closePopup: function () {
      popupViewInfo.elem.classList.remove(popupViewInfo.classOpened);
    }
  };

  if (popupViewInfo.elem) {
    popupViewInfo.arrow = popupViewInfo.elem.querySelector('.popup__arrow');
  }

  function chageClassOnScroll () {
    popupViewInfo.closePopup();

    if (shedule.scrollLeft < 30) {
      shedule.classList.remove(scrollClass);
    } else {
      shedule.classList.add(scrollClass);
    }
  }

  const shedule = document.querySelector('.shedule');
  const scrollClass = 'shedule--scroll';

  if (shedule) {
    shedule.addEventListener('scroll', () => {
      throttle(chageClassOnScroll);
    });

    window.addEventListener('scroll', () => {
      throttle(chageClassOnScroll);
    });
  }
}(this));

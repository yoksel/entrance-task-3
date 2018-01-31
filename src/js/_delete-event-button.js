'use strict';

// ------------------------------
// ACTIONS FOR DELETE EVENT BUTTON
// ------------------------------

(function () {
  const formButtonRemove = document.querySelector('.form__button--remove');
  const popupButtonRemove = document.querySelector('.popup__button--remove');
  const popupButtonCancel = document.querySelector('.popup__button--cancel');
  const fader = document.querySelector('.popup-fader');
  let bodyClass = '';

  if (formButtonRemove) {
    bodyClass = formButtonRemove.dataset.bodyclass;
    formButtonRemove.addEventListener('click', openPopup);
    popupButtonRemove.addEventListener('click', leavePage);
    popupButtonCancel.addEventListener('click', closePopup);
    fader.addEventListener('click', closePopup);
  }

  function openPopup (event) {
    event.preventDefault();
    document.body.classList.add(bodyClass);
  }

  function leavePage () {
    document.location.href = './';
  }

  function closePopup () {
    document.body.classList.remove(bodyClass);
  }
}());

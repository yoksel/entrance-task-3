// ------------------------------
// ACTIONS FOR DELETE EVENT BUTTON
// ------------------------------

(function (window) {
  const closePopups = window.closePopups;

  const formButtonRemove = document.querySelector('.form__button--remove');
  const popupButtonRemove = document.querySelector('.popup__button--remove');
  const popupButtonCancel = document.querySelector('.popup__button--cancel');
  const fader = document.querySelector('.popup-fader');

  if (formButtonRemove) {
    formButtonRemove.addEventListener('click', openPopup);
    popupButtonRemove.addEventListener('click', leavePage);
    popupButtonCancel.addEventListener('click', closePopup);
    fader.addEventListener('click', closePopup);
  }

  function openPopup (event) {
    event.preventDefault();
    document.body.classList.add('page--popup-opened');
  }

  function leavePage () {
    document.location.href = './';
  }

  function closePopup () {
    document.body.classList.remove('page--popup-opened');
    closePopups();
  }
}(window));

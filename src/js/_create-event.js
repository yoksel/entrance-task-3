// ------------------------------
// CREATE EVENT POPUP
// ------------------------------

(function () {
  const searchStr = document.location.search.substr(1);
  const searchArr = searchStr.split('&');
  const query = {};
  const buttonClose = document.querySelector('.popup__button--ok');

  searchArr.forEach(item => {
    const itemArr = item.split('=');
    query[itemArr[0]] = itemArr[1];
  });

  if (query.action === 'create') {
    openPopup();
  }

  if (buttonClose) {
    buttonClose.addEventListener('click', closePopup);
  }

  function openPopup () {
    document.body.classList.add('page--popup-opened');
  }

  function closePopup () {
    document.body.classList.remove('page--popup-opened');
  }
}());

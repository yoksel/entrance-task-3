// ------------------------------
// SELECT USERS
// ------------------------------

(function () {
  const SelectRoom = function (elem) {
    this.elem = elem;
    const items = elem.querySelectorAll('.select-room__item');

    items.forEach(item => {
      const label = item.querySelector('.select-room__label');
      const input = item.querySelector('.select-room__input');
      const closeControl = item.querySelector('.close-control');

      label.addEventListener('click', () => {
        this.elem.classList.add('select-room--room-selected');
      });

      closeControl.addEventListener('click', () => {
        input.checked = false;
        this.elem.classList.remove('select-room--room-selected');
      });
    });
  };

  const selectRooms = document.querySelectorAll('.select-room');

  selectRooms.forEach(item => {
    const selectRoom = new SelectRoom(item);
  });
}());

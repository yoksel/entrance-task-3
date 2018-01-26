// ------------------------------
// HIGHLIGHT ROOMS
// ------------------------------

(function () {
  const SlotsList = function (elem) {
    const slotButtons = elem.querySelectorAll('.slot__button:not(.button-show-event)');
    const roomId = elem.dataset.roomId;
    const that = this;
    this.roomElem = document.querySelector(`.room--${roomId}`);
    const classes = {
      hover: 'room--slot-highlighted',
      press: 'room--slot-pressed'
    };

    if (!roomId) {
      return;
    }

    slotButtons.forEach(button => {
      button.addEventListener('mouseover', () => {
        that.roomElem.classList.add(classes.hover);
      });

      button.addEventListener('mouseout', () => {
        that.roomElem.classList.remove(classes.hover);
      });

      button.addEventListener('mousedown', () => {
        that.roomElem.classList.add(classes.press);
      });

      button.addEventListener('mouseup', () => {
        that.roomElem.classList.add(classes.press);
      });
    });
  };

  const slotsLists = document.querySelectorAll('.slots__list');
  slotsLists.forEach = [].forEach;

  slotsLists.forEach(item => {
    const slotsList = new SlotsList(item);
  });
}());

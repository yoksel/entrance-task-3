'use strict';

// ------------------------------
// SELECT USERS
// ------------------------------

(function (window) {
  const SelectRoom = function (elem) {
    this.elem = elem;
    this.legend = elem.querySelector('.form__legend');
    const items = elem.querySelectorAll('.select-room__item');
    this.list = elem.querySelector('.select-room__items');
    this.inputs = [];
    this.group = document.querySelector('.form__group--rooms');
    const eventRoomTmplElem = document.querySelector('.templates .select-room__item');
    this.eventRoomTmpl = getTemplate(eventRoomTmplElem.outerHTML);

    this.elem.addEventListener('click', (even) => {
      const target = event.target;
      const context = event.target.parentNode;

      if (target.classList.contains('close-control')) {
        const input = context.querySelector('.select-room__input');
        input.checked = false;
        this.elem.classList.remove('select-room--room-selected');

      }
      else {
        this.elem.classList.add('select-room--room-selected');
      }
    });
  };

  SelectRoom.prototype.setRooms = function(rooms, defaultRoom, date){
    const event = {
      timeStart: moment(date.start).format('H:mm'),
      timeEnd: moment(date.end).format('H:mm')
    };
    const roomsItems = rooms.map(room => {
      return this.addRoom(room, event, defaultRoom);
    });

    this.list.innerHTML = roomsItems.join('');

    this.group.classList.remove('form__group--hidden');

    if (rooms.indexOf(defaultRoom) >= 0) {
      this.elem.classList.add('select-room--room-selected');
      this.legend.innerHTML = 'Ваша переговорка';
    }
    else {
      this.elem.classList.remove('select-room--room-selected');
      this.legend.innerHTML = 'Рекомендованные переговорки';
    }
  }

  SelectRoom.prototype.addRoom = function (id, event) {
    const data = pageData.rooms[id];
    data.event = event;
    Mustache.parse(this.eventRoomTmpl);
    const rendered = Mustache.render(this.eventRoomTmpl, data);

    return rendered;
  };

  const selectRoomElem = document.querySelector('.select-room');

  if (selectRoomElem) {
    const selectRoom = new SelectRoom(selectRoomElem);
    window.selectRoom = selectRoom;
  }


}(window));

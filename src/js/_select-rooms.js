'use strict';

/* global moment, Mustache, pageData, getTemplate */

// ------------------------------
// SELECT USERS
// ------------------------------

(function (window) {
  const SelectRoom = function (elem) {
    this.elem = elem;
    this.legend = elem.querySelector('.form__legend');
    this.list = elem.querySelector('.select-room__items');
    this.inputs = [];
    this.eventSwapEventElem = elem.querySelector('.select-room__swap-event');
    this.eventSwapFromlElem = elem.querySelector('.select-room__swap-from-room');
    this.eventSwapTolElem = elem.querySelector('.select-room__swap-to-room');
    this.group = document.querySelector('.form__group--rooms');
    const eventRoomTmplElem = document.querySelector('.templates .select-room__item--room');
    this.eventRoomTmpl = getTemplate(eventRoomTmplElem.outerHTML);
    const eventSwapTmplElem = document.querySelector('.templates .select-room__item--swap');
    this.eventSwapTmpl = getTemplate(eventSwapTmplElem.outerHTML);
    this.recommendation = {};

    this.elem.addEventListener('click', (event) => {
      const target = event.target;
      const context = event.target.parentNode;

      if (target.classList.contains('close-control')) {
        const input = context.querySelector('.select-room__input--room');
        input.checked = false;
        this.elem.classList.remove('select-room--room-selected');
      } else if (target.classList.contains('event-swap')) {
        this.saveSwap(target.dataset);
      } else {
        this.elem.classList.add('select-room--room-selected');
      }
    });
  };

  SelectRoom.prototype.setRooms = function (recommendation, defaultRoom) {
    this.recommendation = recommendation;
    const rooms = recommendation.rooms;
    const date = recommendation.date;
    const event = {
      timeStart: moment(date.start).format('H:mm'),
      timeEnd: moment(date.end).format('H:mm')
    };
    const roomsItems = rooms.map(room => {
      const data = pageData.rooms[room];
      data.event = event;
      return this.addVariant(data, this.eventRoomTmpl);
    });

    if (recommendation.rooms.length > 0) {
      this.list.innerHTML = roomsItems.join('');
    }

    if (!defaultRoom && recommendation.rooms.length > 0) {
      this.group.classList.remove('form__group--hidden');
    }

    if (rooms.indexOf(defaultRoom) >= 0) {
      this.elem.classList.add('select-room--room-selected');
      this.legend.innerHTML = 'Ваша переговорка';
    } else {
      this.elem.classList.remove('select-room--room-selected');
      this.legend.innerHTML = 'Рекомендованные переговорки';
    }
  };

  SelectRoom.prototype.showSwaps = function (recommendation) {
    const swaps = recommendation.swaps;
    this.recommendation = recommendation;

    const swapsItems = swaps.map(swap => {
      const event = pageData.events[swap.event];
      event.timeStart = moment(event.dateSrc.start).format('H:mm');
      event.timeEnd = moment(event.dateSrc.end).format('H:mm');
      const roomFrom = pageData.rooms[event.roomId];
      const roomTo = pageData.rooms[swap.room];
      const data = {
        event: event,
        from: {
          id: roomFrom.id,
          title: roomFrom.title,
          floor: roomFrom.floor
        },
        to: {
          id: roomTo.id,
          title: roomTo.title,
          floor: roomTo.floor
        }
      };

      return this.addVariant(data, this.eventSwapTmpl);
    });

    this.list.innerHTML = swapsItems.join('');
  };

  SelectRoom.prototype.saveSwap = function (dataSet) {
    this.eventSwapEventElem.value = dataSet.swapEvent;
    this.eventSwapFromlElem.value = dataSet.swapFromRoom;
    this.eventSwapTolElem.value = dataSet.swapToRoom;

    const data = pageData.rooms[dataSet.swapFromRoom];
    const date = this.recommendation.date;
    const event = {
      timeStart: moment(date.start).format('H:mm'),
      timeEnd: moment(date.end).format('H:mm')
    };
    data.event = event;
    data.checked = 'checked';

    this.list.innerHTML = this.addVariant(data, this.eventRoomTmpl);
    this.elem.classList.add('select-room--room-selected');
    this.legend.innerHTML = 'Ваша переговорка';
  };

  SelectRoom.prototype.addVariant = function (data, tmpl) {
    Mustache.parse(tmpl);
    const rendered = Mustache.render(tmpl, data);

    return rendered;
  };

  const selectRoomElem = document.querySelector('.select-room');

  if (selectRoomElem) {
    const selectRoom = new SelectRoom(selectRoomElem);
    window.selectRoom = selectRoom;
  }
}(window));

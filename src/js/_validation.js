(function () {
  const form = document.querySelector('.form--event');

  if (!form) {
    return;
  }

  const classGroupWarning = 'form__group--warning';
  const textInputs = form.querySelectorAll('.form__input');
  const usersInputs = form.querySelectorAll('input[name="usersIds"]');
  const usersTextInput = form.querySelector('.select-users__input--text');
  const messageElem = form.querySelector('.form__message');
  const messageTextElem = form.querySelector('.form__message-text');

  form.addEventListener('submit', (event) => {
    const messageTextInputs = checkTextInputs();

    if (messageTextInputs) {
      event.preventDefault();
      messageTextElem.innerHTML = messageTextInputs;
      messageElem.classList.add('form__message--shown');
      return;
    }

    const messageUsersInputs = checkUsersInputs();

    if (messageUsersInputs) {
      event.preventDefault();
      messageTextElem.innerHTML = messageUsersInputs;
      messageElem.classList.add('form__message--shown');
      return;
    }

    const messageRoomsInputs = checkRoomsInputs();

    if (messageRoomsInputs) {
      event.preventDefault();
      messageTextElem.innerHTML = messageRoomsInputs;
      messageElem.classList.add('form__message--shown');
    }
  });

  function checkUsersInputs () {
    usersInputs.some = [].some;
    const groupClass = usersInputs[0].dataset.group;
    const group = form.querySelector(groupClass);

    const isChecked = usersInputs.some(input => {
      if (!input.checked) {
        usersTextInput.addEventListener('focus', () => {
          group.classList.remove(classGroupWarning);
          messageElem.classList.remove('form__message--shown');
        });
      }

      return input.checked;
    });

    if (!isChecked) {
      group.classList.add(classGroupWarning);

      const message = `Добавьте участников`;
      return message;
    }
  }

  function checkRoomsInputs () {
    const roomsInputs = form.querySelectorAll('input[name="roomId"]');
    let message = '';

    if (!roomsInputs[0]) {
      message = `Чтобы выбрать переговорку, заполните дату, время и участников`;
      return message;
    }

    const groupClass = roomsInputs[0].dataset.group;
    const group = form.querySelector(groupClass);

    roomsInputs.some = [].some;

    const isChecked = roomsInputs.some(input => {
      if (!input.checked) {
        input.addEventListener('change', () => {
          group.classList.remove(classGroupWarning);
          messageElem.classList.remove('form__message--shown');
        });
        input.addEventListener('focus', () => {
          group.classList.remove(classGroupWarning);
          messageElem.classList.remove('form__message--shown');
        });
      }

      return input.checked;
    });

    if (!isChecked) {
      group.classList.add(classGroupWarning);

      message = `Выберите переговорку`;
      return message;
    }
  }

  function checkTextInputs () {
    for (let i = 0; i < textInputs.length; i++) {
      const input = textInputs[i];

      if (!input.value) {
        const groupClass = input.dataset.group;
        const group = form.querySelector(groupClass);
        group.classList.add(classGroupWarning);

        const label = input.labels[0].innerHTML;
        const message = `Заполните поле «${label}»`;

        input.addEventListener('focus', () => {
          group.classList.remove(classGroupWarning);
          messageElem.classList.remove('form__message--shown');
        });
        return message;
      }
    }
  }
}());

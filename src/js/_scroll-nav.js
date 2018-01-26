/* global closePopups */

// ------------------------------
// SCROLL NAV
// ------------------------------

(function () {
  const currenTimeMarker = {
    elem: document.querySelector('.current-time'),
    classHidden: 'current-time--hidden'
  };

  const ScrollNav = function (elem) {
    this.elem = elem;
    this.controls = elem.querySelectorAll('.scroll-nav__control');
    this.items = elem.querySelector('.scroll-nav__items');
    this.currentClass = `${elem.dataset.target}--current`;
    this.currentElem = document.querySelector(`.${this.currentClass}`);
    this.contentCount = 0;

    if (!this.currentElem) {
      return;
    }

    this.controls.forEach(control => {
      if (control.classList.contains('scroll-nav__control--left')) {
        control.dataset.direction = 'backward';
        this.leftControl = control;
      } else {
        control.dataset.direction = 'forward';
        this.rightControl = control;
      }

      this.checkNextTarget(control);

      control.addEventListener('click', (event) => {
        event.stopPropagation();
        this.switchContent(control);
      });
    });
  };

  ScrollNav.prototype.checkNextTarget = function (control) {
    if (this.currentElem) {
      let target = this.currentElem.nextElementSibling;

      if (control.dataset.direction === 'backward') {
        target = this.currentElem.previousElementSibling;
      }

      if (!target) {
        control.disabled = true;
      } else {
        control.disabled = false;
      }
    }
  };

  ScrollNav.prototype.switchContent = function (control) {
    if (this.currentElem) {
      let target = this.currentElem.nextElementSibling;

      if (control.dataset.direction === 'backward') {
        target = this.currentElem.previousElementSibling;
        this.contentCount--;
      } else {
        this.contentCount++;
      }

      this.items.style.transform = `translateX(${this.contentCount * -100}%)`;

      this.currentElem.classList.remove(this.currentClass);
      target.classList.add(this.currentClass);
      this.currentElem = target;

      this.checkNextTarget(this.rightControl);
      this.checkNextTarget(this.leftControl);
    }

    if (this.elem.dataset.target === 'shedule__day') {
      this.toggleCurrentTime();
      closePopups();
    }
  };

  ScrollNav.prototype.toggleCurrentTime = function () {
    if (this.contentCount > 0) {
      currenTimeMarker.elem.classList.add('current-time--hidden');
    } else {
      currenTimeMarker.elem.classList.remove('current-time--hidden');
    }
  };

  const scrollNavElems = document.querySelectorAll('.scroll-nav');

  scrollNavElems.forEach(item => {
    const scrollNav = new ScrollNav(item);
  });
}());

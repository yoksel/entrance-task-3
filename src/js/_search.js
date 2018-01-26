// ------------------------------
// SEARCH
// ------------------------------

// Usage:
// <input
//  class="search-input"
//  type="search"
//  data-selector=".room"  <-- class of items for search on the same page
//  placeholder="Найти переговорку">
//
// Searchable item markup:
// <li class="item room" data-searchtitle="${itemData.title}">

(function () {
  const Search = function (elem) {
    const itemsSelector = elem.dataset.selector;
    this.items = document.querySelectorAll(itemsSelector);

    if (!this.items[0]) {
      return;
    }

    this.itemsParent = this.items[0].parentNode;
    this.searchResultsClass = 'search-results';
    this.classFounded = 'search-results__founded';
    this.searchResults = [];

    elem.addEventListener('input', () => {
      this.findItems(elem.value);
    });
  };

  Search.prototype.findItems = function (value) {
    this.searchResults.forEach(item => {
      item.classList.remove(this.classFounded);
    });
    this.searchResults = [];

    if (value.length === 0) {
      this.itemsParent.classList.remove(this.searchResultsClass);
      return;
    }

    this.itemsParent.classList.add(this.searchResultsClass);

    this.items.forEach(item => {
      const valueLowerCase = value.toLowerCase();
      const titleLowerCase = item.dataset.searchtitle.toLowerCase();

      if (titleLowerCase.indexOf(valueLowerCase) >= 0) {
        item.classList.add(this.classFounded);
        this.searchResults.push(item);
      }
    });
  };

  const searchInputs = document.querySelectorAll('.search-input');

  searchInputs.forEach(item => {
    const search = new Search(item);
  });
}());

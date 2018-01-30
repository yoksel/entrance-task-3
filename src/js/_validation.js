(function() {
  const form = document.querySelector('.form');

  form.addEventListener('sumbit', (event) => {
    console.log('submit');
    return false;
  });
});

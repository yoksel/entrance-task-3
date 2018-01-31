'use strict';

function throttle (func) {
  setTimeout(func, 100);
}

// ------------------------------

// Way to keep mustache templates untouched after
// page rendering from server side
// In templates was used [ & ] instead of [[ ]]
function getTemplate (html) {
  html = html.replace(/\[/g, '{');
  html = html.replace(/]/g, '}');

  return html;
}

// ------------------------------

function getPlural (count, variantsStr) {
  let result = '';
  const variants = variantsStr.split('|');

  if (count > 5 && count < 21) {
    result = variants[2];
  } else {
    const lastDigit = count % 10;

    if (lastDigit === 1) {
      result = variants[0];
    } else if (lastDigit < 5) {
      result = variants[1];
    } else {
      result = variants[2];
    }
  }

  return result;
}

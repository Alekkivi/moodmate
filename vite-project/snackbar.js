'use strict';

/**
 * Displays a snackbar with the specified color and text message.
 * @param {string} color - The background color of the snackbar.
 * @param {string} text - The text message to be displayed in the snackbar.
 */
function showSnackbar(color, text) {
  // Find the snackbar target element
  const x = document.getElementById('snackbar-target');
  // Set text content
  x.innerText = text;
  // Set snackbar color
  x.style.backgroundColor = color;
  // Display snackbar
  x.classList.add('show');
  // Wait 3 seconds and hide the snackback
  setTimeout(function() {
      x.classList.remove('show');
  }, 3000);
}

export {showSnackbar}
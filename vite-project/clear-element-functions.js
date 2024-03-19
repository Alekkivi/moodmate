'use strict';
// --------- Functions for Regular.html -------------------
// Clear entries element
function clearEntries() {
    // Find the element and make sure to overwrite it
    const target = document.querySelector('.right-diary');
    target.innerHTML = '';
    document.querySelector('#hide_all_entries').style.display = 'None';
}
  
function clearExercises() {
    document.querySelector('.tbody').innerHTML = '';
    document.querySelector('.thead').innerHTML = '';
    document.querySelector('.middle-exercise').innerHTML = '';
    document.querySelector('#hide_all_exercises').style.display = 'None';
}

// --------- Functions for admin.html -------------------
// Clear entries element
function clearEntriesForAdmin() {
  document.querySelector('#hide_all_entries').style.display = 'none';
  // Find the element and make sure to overwrite it
  const target = document.querySelector('#entry_target');
  target.innerHTML = '';
}
// Clear users table
function clearUsersForAdmin() {
  document.querySelector('#hide_all_users').style.display = 'none';
  // Find the element and make sure to overwrite it
  document.querySelector('.tbody').innerHTML = '';
  document.querySelector('thead').innerHTML = '';
}

export {clearEntries, clearExercises, clearEntriesForAdmin, clearUsersForAdmin}
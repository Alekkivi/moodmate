'use strict';
import { formatDate, convertDate } from './date-functions';
import { showSnackbar } from './snackbar';
import { get } from './fetch';

// Get detailed user info using table rows - For admin user
async function getUserInfo(evt) {
  // Get User ID from the specific row
  const id = evt.target.getAttribute('data-id');
  console.log(`Accessing user info: user_id = ${id}`);
  // Send GET request
  const data = await get(`/api/users/${id}`)
  // Check for errors in the response
  if (!data.error){
    // Show user info in a modal
    showModal(data);
  } else {
    // Inform admim about a error
    showSnackbar('crimson', data.message)
  }
}

// Get detailed user info using table rows - For regular user
async function getUserInfoRegular(id) {
  // Get User ID from the specific row
  console.log(`Accessing user info: user_id = ${id}`);
  // Send GET request
  const data = await get(`/api/users/${id}`)
  // Check for errors in the response
  if (!data.error){
    // Show user info in a modal
    showModal(data);
  } else {
    // Inform admim about a error
    showSnackbar('crimson', data.message)
  }
}

// Insert userdata into a modal
function showModal(userData) {
  // Get necessary elements and make sure they are empty
  const modal = document.querySelector('.info_dialog');
  const div = document.getElementById('modal_target');
  div.innerHTML = '';

  // Iterate over rows of user data
  for (let key in userData) {
    let value = userData[key];
    // Check for 'Username' -row to set it as a header for the model
    if (key === 'Username') {
      let h3 = document.createElement('h3');
      h3.innerText = value;
      div.appendChild(h3);
    // Check for 'Created at' -row to format the date
    } else if (key === 'Created at') {
      let p = document.createElement('p');
      p.innerHTML = `<span>${key}:</span> ${formatDate(convertDate(value))}`;
      div.appendChild(p);
    // Append the rest of the rows as P -elements
    } else {
      let p = document.createElement('p');
      p.innerHTML = `<span>${key}:</span> ${value}`;
      div.appendChild(p);
    }
  }
  // Append div to modal
  modal.appendChild(div);
  // Create and append a 'Close' -button for the modal
  let closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  div.appendChild(closeButton);
  // Attach a event listener to close the modal
  closeButton.addEventListener('click', () => {
    modal.close();
  });
  // Display modal
  modal.showModal();
}

export {showModal, getUserInfo, getUserInfoRegular}
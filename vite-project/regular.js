'use strict';
import { convertDate, formatDate, getCurrentDate } from './date-functions.js';
import { clearEntries, clearExercises } from './clear-element-functions.js';
import { getUserInfoRegular } from './modal-functions.js';
import { deleteEntry } from './delete-card.js';
import { showSnackbar } from './snackbar.js';
import { deleteRequest } from './delete.js';
import { postRequest } from './post.js';
import { putRequest } from './put.js';
import { logOut } from './log-out.js';
import { get } from './fetch.js';
import './universal-styles.css';
import './regular-style.css';

// Authorization for page refresh
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch data
    const data = await get('/api/auth/me');
    const token = localStorage.getItem('token');
    // Check token and userlevel related to token
    if (data.error === 'invalid token' || !token) {
      throw new Error('Unauthorized');
    } else {
      // Save data from GET to local storage
      console.log('Page reload getMe', data);
      localStorage.setItem('user_id', data.user.user_id);
      localStorage.setItem('username', data.user.username);

      // Update username to landing page
      document.querySelector('#greeting-header').innerHTML = `Welcome back ${data.user.username}!`;
      document.querySelector('#date-header').innerHTML = formatDate(getCurrentDate());
      document.getElementById('notes').value ='';
    }
  } catch (error) {
    // Accessing client was unauthorized
    window.location.href = 'index.html';
  }
});

// Get and listen for 'Cancel' -link
const cancelAccountUpdateBtn = document.querySelector('#cancel-account-update-button')
cancelAccountUpdateBtn.addEventListener('click', cancelAccountUpdate)

// Get and listen for 'Update login' -link 
const viewProfileBtn = document.querySelector('#view-user-text-button');
viewProfileBtn.addEventListener('click', displayUserInfo);

function displayUserInfo(){
  console.log('clicked')
  const userId = localStorage.getItem('user_id')
  getUserInfoRegular(userId)
}

// Get and listen for 'Update login' -link 
const updateAccountLink = document.querySelector('#update-account-text-button');
updateAccountLink.addEventListener('click', createAccountUpdateForm);

// Create a form that enables user to update user info
function createAccountUpdateForm() {
  // Hide 'Update login' button
  document.querySelector('#update-account-text-button').style.display = 'none';
  // Show the form
  const form = document.querySelector('#update-user-form');
  form.style.display = 'block';
  // Show the cancel button
  const cancelBtn = document.querySelector('#cancel-account-update-button');
  cancelBtn.style.display = 'block';

  // Remove existing event listener to prevent multiple form submission 
  form.removeEventListener('submit', formSubmitHandler);
  // Add new event listener
  form.addEventListener('submit', formSubmitHandler);
}

// Form submission handler
function formSubmitHandler(event) {
  event.preventDefault();
  // Input validation 
  if (!event.target.checkValidity()) {
      event.target.reportValidity();
      return;
  } else {
      // Gather data from form if it passes validation
      gatherUpdateFormData();
  }
}


// Form request body from 'Update account information' -form
function gatherUpdateFormData() {
  // New username
  const usernameValue = document.querySelector(
    'input[name="updated-username"]').value;
  // New password
  const passwordValue = document.querySelector(
    'input[name="updated-password"]').value;
  // New email
  const emailValue = document.querySelector(
    'input[name="updated-email"]').value;
  // Format this data and send it in a request
  const data = {
    username: usernameValue,
    password: passwordValue,
    email: emailValue,
  };
  // Serve PUT request body
  putUser(data);
}

// Send PUT request with 'Update account information' data and handle response
async function putUser(userData) {
  // Send PUT request
  const data = await putRequest('/api/users', userData);
  // Check for error in response
  if (!data.error) {
    // Display successful operation to user
    showSnackbar('darkgreen', 'Account information updated!');
    localStorage.setItem('username', userData.username);
    // Update the greeting header to match new username
    document.querySelector('#greeting-header').innerHTML = `Welcome back ${userData.username}!`;
    // Hide the 'Update account information' -form
    cancelAccountUpdate();
  } else {

    // Bad request error indicates that there is a problem with the syntax
    if (data.error === 'Bad Request'){
      showSnackbar('Crimson', 'Invalid username or email address')
    } else if (data.status === 409){
      showSnackbar('crimson', data.error)
    } else {
      // There was a unknown error 
      showSnackbar('crimson', 'Account could not be updated');
    }
  }
}

// Hide 'Update account information' form
function cancelAccountUpdate() {
  // Display 'Update login' link
  document.querySelector('#update-account-text-button').style.display = 'block';
  // Hide 'Cancel' link and the form and reset it
  document.querySelector('#cancel-account-update-button').style.display = 'none';
  const form = document.querySelector('#update-user-form');
  form.style.display = 'none';
  form.reset();
}

// Get and listen for 'Get entries' -button
const getEntriesBtn = document.querySelector('#get_all_entries');
getEntriesBtn.addEventListener('click', createCardSet);

// Fetch a list of entries and create a card for each entry
async function createCardSet() {
  // GET all entries
  const entries = await get('/api/entries');
  // Unveil 'Hide entries' Button
  hideEntriesBtn.style.display = 'inline';
  // Check response length (Endpoint returns empty list if no entries were found)
  const entryCount = Object.keys(entries).length;
  if (entryCount === 0) {
    // Inform the user that no entries were found
    return showSnackbar('crimson', 'No entries found');
  }
  // Inform the user on how many entries were found
  showSnackbar('Darkgreen', `${entryCount} entries found`);
  // Make sure the target area is empty
  const entriesContainer = document.querySelector('.right-diary');
  entriesContainer.innerHTML = '';
  // Iterate over every entry
  entries.forEach((row) => {
    // Create and append the card to the container
    entriesContainer.appendChild(createSingleCard(row));
  });
}

// Using entry data create a card element
function createSingleCard(entry) {
  // Create card element and add an id to it
  const card = document.createElement('div');
  card.classList.add('card');
  card.id = entry.entry_id;
  // Save the data from the entry to variables
  const entryId = entry.entry_id;
  const moodColor = entry.mood_color;
  const weight = entry.weight;
  const notes = entry.notes;
  const sleepHours = entry.sleep_hours;
  const date = convertDate(entry.entry_date);
  // Create the mood color element
  const moodColorElement = document.createElement('div');
  moodColorElement.classList.add('mood-colour');
  moodColorElement.id = 'trigger';
  moodColorElement.style.backgroundColor = moodColor;
  // Div for two option buttons
  const entryOptionsDiv = document.createElement('div');
  entryOptionsDiv.classList.add('entry-options');
  // Button to delete entry
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = 'X';
  deleteButton.classList.add('delete-button');
  deleteButton.setAttribute('data-id', entryId);
  // Attach an event listener for each card
  deleteButton.addEventListener('click', function (evt) {
    deleteEntry(evt, entryId);
  });
  // Button to edit entry
  const editButton = document.createElement('button');
  editButton.innerHTML = 'Edit';
  editButton.classList.add('entry-button');
  editButton.setAttribute('data-id', entryId);
  // Attach an event listener for each card
  editButton.addEventListener('click', function (evt) {
    editEntry(date, entryId);
  });
  // Create a header element for the card - Date acts as a header
  const h4Element = document.createElement('h4');
  h4Element.textContent = formatDate(date);
  // Create a div element for p-elements
  const cardDiaryElement = document.createElement('div');
  cardDiaryElement.classList.add('card-diary');
  // Weight
  const weightP = document.createElement('p');
  weightP.textContent = `Weight: ${weight}`;
  // Sleep
  const sleepHoursP = document.createElement('p');
  sleepHoursP.textContent = `Sleep hours: ${sleepHours}`;
  // Notes
  const notesh5 = document.createElement('h5');
  notesh5.textContent = `Notes`;
  const notesDiv = document.createElement('div');
  const notesP = document.createElement('p');
  notesDiv.classList.add('card-notes-section');
  notesP.textContent = notes;
  notesDiv.appendChild(notesP);
  // Append card header elements
  entryOptionsDiv.appendChild(editButton);
  entryOptionsDiv.appendChild(deleteButton);
  moodColorElement.appendChild(h4Element);
  moodColorElement.appendChild(entryOptionsDiv);
  // Append all text rows to card body
  cardDiaryElement.appendChild(weightP);
  cardDiaryElement.appendChild(sleepHoursP);
  cardDiaryElement.appendChild(notesh5);
  cardDiaryElement.appendChild(notesDiv);
  // Append mood color and card body to card
  card.appendChild(moodColorElement);
  card.appendChild(cardDiaryElement);
  return card;
}

// Function for 'Edit' in-card button
function editEntry(date, entryId) {
  // Replace the 'Create diary entry' -form with a new 'Edit entry' -form
  const div = createUpdateForm(date, entryId);
  const leftBottomDiary = document.querySelector('.bottom-left-diary');
  leftBottomDiary.innerHTML = '';
  leftBottomDiary.appendChild(div);
}

// Create form to update a specific entry
function createUpdateForm(date, entryId) {
  // Create a header for the new form
  const h3 = document.createElement('h3');
  h3.innerHTML = `Currently modifying entry from: ${formatDate(date)}`;
  // Create form
  const div = document.createElement('div');
  div.classList.add('container');
  div.appendChild(h3);
  const form = document.createElement('form');
  div.id = 'modify-entry-form';
  form.id = 'entry_form';
  form.setAttribute('method', 'post');
  form.setAttribute('id', 'entry_form');
  // Create label and select for mood
  const moodLabel = document.createElement('label');
  moodLabel.setAttribute('for', 'mood');
  moodLabel.textContent = 'Update color';
  form.appendChild(moodLabel);
  // Create a dropdown menu with different colors to choose from
  const moodSelect = document.createElement('select');
  moodSelect.setAttribute('id', 'mood');
  moodSelect.setAttribute('name', 'mood');
  ["Select a color", "Red", "Orange", "Yellow", "Green"].forEach((color) => {
    let option = document.createElement('option');
    option.value = color;
    option.textContent = color;
    // create a placeholder 
    if (color === 'Select a color'){
      option.disabled = true;
      option.selected = true;
      option.hidden = true;
    }
    moodSelect.appendChild(option);
  });
  form.appendChild(moodSelect);
  // Create label for weight
  const weightLabel = document.createElement('label');
  weightLabel.setAttribute('for', 'weight');
  weightLabel.textContent = 'Weight (kg):';
  form.appendChild(weightLabel);
  // Create input for weight
  const weightInput = document.createElement('input');
  weightInput.setAttribute('type', 'number');
  weightInput.setAttribute('id', 'weight');
  weightInput.setAttribute('name', 'weight');
  weightInput.setAttribute('step', '0.1');
  weightInput.setAttribute('min','0.1')
  weightInput.setAttribute('max','635')
  weightInput.setAttribute('placeholder', 'Enter your weight');
  weightInput.required = true;
  form.appendChild(weightInput);
  // Create label for sleep
  const sleepLabel = document.createElement('label');
  sleepLabel.setAttribute('for', 'sleep');
  sleepLabel.textContent = 'Sleep hours:';
  form.appendChild(sleepLabel);
  // Create input for sleep
  const sleepInput = document.createElement('input');
  sleepInput.setAttribute('type', 'number');
  sleepInput.setAttribute('id', 'sleep');
  sleepInput.setAttribute('name', 'sleep');
  sleepInput.setAttribute('step', '0.1');
  sleepInput.setAttribute('min','0')
  sleepInput.setAttribute('max','24')
  sleepInput.setAttribute('placeholder', 'Enter your sleep hours');
  sleepInput.required = true;
  form.appendChild(sleepInput);
  // Create label for notes
  const notesLabel = document.createElement('label');
  notesLabel.setAttribute('for', 'notes');
  notesLabel.textContent = 'Update description';
  form.appendChild(notesLabel);
  // Create input for notes
  const notesTextarea = document.createElement('textarea');
  notesTextarea.setAttribute('id', 'notes');
  notesTextarea.setAttribute('name', 'notes');
  notesTextarea.setAttribute('rows', '8');
  notesTextarea.setAttribute('placeholder', 'Enter additional notes');
  notesTextarea.style.resize = 'none';
  notesTextarea.setAttribute('maxlength', '250');
  form.appendChild(notesTextarea);
  // Create submit button
  const submitButton = document.createElement('button');
  submitButton.setAttribute('type', 'submit');
  submitButton.setAttribute('id', 'entry_submit');
  submitButton.textContent = 'Update diary entry';
  form.appendChild(submitButton);
  // Create cancel button
  const cancelButton = document.createElement('button');
  cancelButton.setAttribute('type', 'button'); // Change 'click' to 'button'
  cancelButton.setAttribute('id', 'cancel');
  cancelButton.textContent = 'Cancel';
  form.appendChild(cancelButton); // Append the cancel button to the form
  // Add event listener for 'Update diary entry' -button
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // Validate input
    if (!form.checkValidity()) {
      form.reportValidity()
      showSnackbar('Crimson', 'Invalid input')
      return;
    } else {
      updateEntry(date, entryId);
    }
  });
  // Add event listener for 'Cancel' -button
  cancelButton.addEventListener('click', (event) => {
    event.preventDefault();
    replaceEditEntryForm();
  });
  div.append(form);
  return div;
}

// Gather data from Update entry -form
function updateEntry(date, entryId) {
  const mood = document.getElementById('mood').value;
  const weight = document.getElementById('weight').value;
  const sleep = document.getElementById('sleep').value;
  const notes = document.getElementById('notes').value;
  if (mood === 'Select a color'){
    showSnackbar('Crimson', 'Please select a color to represent your mood');
    return;

  }
  // Format data for request
  const entryFormData = {
    entry_id: entryId,
    mood_color: mood,
    weight: weight,
    notes: notes,
    sleep_hours: sleep,
    user_id: localStorage.getItem('user_id'),
    entry_date: date,
  };
  console.log('update entry:', entryFormData);
  // Send PUT request with form data
  putEntry(entryFormData);
  replaceEditEntryForm();
}

// Send a PUT request to update existing diary entry
async function putEntry(entry) {
  // Define request
  const data = await putRequest('/api/entries', entry)
  // Check response for errors
  if (!data.error) {
    // Notify the user that diary entry was successfully updated
    showSnackbar('darkgreen', 'Entry updated!');
    // Update the cardset
    createCardSet();
  } else {
    // Notify the user that there was an error
    showSnackbar('crimson', 'Couldn\'t update entry!');
  }
}

// Re-create 'Create diary entry' form to cancel entry update process
function replaceEditEntryForm() {
  const bottomLeftDiary = document.querySelector('.bottom-left-diary');
  bottomLeftDiary.innerHTML = '';
  // Create container div
  const container = document.createElement('div');
  container.className = 'container';
  container.id = 'diary-container';
  // Create h1
  const h1 = document.createElement('h1');
  h1.textContent = 'Create a diary entry';
  container.appendChild(h1);
  // Create form
  const form = document.createElement('form');
  form.method = 'post';
  form.id = 'entry_form';
  // Create label and select for mood
  let label = document.createElement('label');
  label.htmlFor = 'mood';
  label.textContent = 'Pick a color to represent your day: ';
  form.appendChild(label);
  // Create dropdown menu to pick colors
  const select = document.createElement('select');
  select.id = 'mood';
  select.name = 'mood';
  ['Select a color', 'Red', 'Orange', 'Yellow', 'Green'].forEach((color) => {
    let option = document.createElement('option');
    option.value = color;
    option.textContent = color;
    // create a placeholder
    if (color === 'Select a color') {
      option.disabled = true;
      option.selected = true;
      option.hidden = true;
      option.value = 'placeholder'
    }
    select.appendChild(option);
  });
  form.appendChild(select);
  // Create label and input for weight
  label = document.createElement('label');
  label.htmlFor = 'weight';
  label.textContent = 'Weight (kg):';
  form.appendChild(label);
  let input = document.createElement('input');
  input.type = 'number';
  input.id = 'weight';
  input.name = 'weight';
  input.step = '0.1';
  input.placeholder = 'Enter your weight';
  input.required = true;
  form.appendChild(input);
  // Create label and input for sleep
  label = document.createElement('label');
  label.htmlFor = 'sleep';
  label.textContent = 'Sleep hours:';
  form.appendChild(label);
  input = document.createElement('input');
  input.type = 'number';
  input.id = 'sleep';
  input.name = 'sleep';
  input.step = '0.1';
  input.placeholder = 'Enter your sleep hours';
  input.required = true;
  form.appendChild(input);
  // Create label and textarea for notes
  label = document.createElement('label');
  label.htmlFor = 'notes';
  label.textContent = 'Describe your day:';
  form.appendChild(label);
  const textarea = document.createElement('textarea');
  textarea.id = 'notes';
  textarea.name = 'notes';
  textarea.rows = '8';
  textarea.placeholder = 'Enter additional notes';
  textarea.style.resize = 'none';
  textarea.maxLength = '250';
  form.appendChild(textarea);
  // Create submit button
  const button = document.createElement('button');
  button.type = 'submit';
  button.id = 'entry_submit';
  button.textContent = 'Create diary entry';
  form.appendChild(button);
  // Attach an event listener to the new 'Create new diary entry' form
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    gatherNewEntryData();
  });
  // Append container to diary section
  container.appendChild(form);
  bottomLeftDiary.appendChild(container);
}

// Get and listen for 'Create a diary entry' -form submit
const entryForm = document.querySelector('#entry_form');
entryForm.addEventListener('submit', (event) => {
  // Get the mood color from form
  const mood = document.getElementById('mood').value;
  event.preventDefault();
  // Input validation
  if (!entryForm.checkValidity()) {
    // Input didn't pass validation
    entryForm.reportValidity();
    return;
  // Make sure user has changed from the placeholder in the dropdown menu
  } else {
    // Form passed all validation continue to send request
    gatherNewEntryData();
  }
});

// Function to gather data from the form
function gatherNewEntryData() {
  // Get form values
  const mood = document.getElementById('mood').value;
  const weight = document.getElementById('weight').value;
  const sleep = document.getElementById('sleep').value;
  const notes = document.getElementById('notes').value;

  if (mood === 'placeholder') {
    showSnackbar('Crimson', 'Please select a color to represent your mood');
    return;
  }
  // Form request body
  const entryFormData = {
    mood_color: mood,
    weight: weight,
    notes: notes,
    sleep_hours: sleep,
    user_id: localStorage.getItem('user_id'),
    entry_date: getCurrentDate(),
  };
  // Prepare to send the request
  postNewEntry(entryFormData);
}

// Send POST request for new diary entry
async function postNewEntry(entry) {
  // Define POST request and send it
  const data = await postRequest('/api/entries', entry); 
  // Check response for error
  if (!data.error) {
    // Notify the user that new entry added
    showSnackbar('darkgreen', 'New entry added!');
  } else {
    // There was a error
    showSnackbar('crimson', "New entry couldn't be added!");
  }
}

// Get and listen for 'Hide entries' -button
const hideEntriesBtn = document.querySelector('#hide_all_entries');
hideEntriesBtn.style.display = 'none';
hideEntriesBtn.addEventListener('click', clearEntries);

// Get and listen for 'Get exercises' -button
const getExercisesBtn = document.querySelector('#get_all_exercises');
getExercisesBtn.addEventListener('click', displayExercises);

// Get all exercises and prepare to display them
async function displayExercises() {
  // Send GET request for exercises
  const exercises = await get("/api/exercises");
  // Check response length (Endpoint returns an empty list if no exercises were found)
  if (Object.keys(exercises).length > 0) {
    // Display 'Hide exercises' button if exercises were found
    document.querySelector('#hide_all_exercises').style.display = 'inline';
    // Create a table to display all exercises
    createExerciseTable(exercises);
    // Send exercises to get statistics
    const exerciseAnalysis = analyseExercises(exercises);
    // Display those statistics
    displayExerciseStats(exerciseAnalysis);
  } else {
    // Notify the user that the server returned an empty list and clear all elements
    showSnackbar('crimson', 'No exercises found');
    clearExercises();
  }
}

// Create table for each exercise
function createExerciseTable(data) {
  // Get the table body and head elements and clear them
  const tbody = document.querySelector('.tbody');
  const thead = document.querySelector('.thead');
  tbody.innerHTML = '';
  thead.innerHTML = '';
  // Create header row
  const headerRow = document.createElement('tr');
  // Create activity header
  const activityHeader = document.createElement('th');
  activityHeader.innerText = 'Activity';
  // Create intensity header
  const intensityHeader = document.createElement('th');
  intensityHeader.innerText = 'Intensity';
  // Create duration header
  const durationHeader = document.createElement('th');
  durationHeader.innerText = 'Duration';
  // Create Date header
  const entryDateHeader = document.createElement('th');
  entryDateHeader.innerText = 'Entry Date';
  // Create delete header
  const deleteHeader = document.createElement('th');
  // deleteHeader.innerText = 'Delete';
  // Append header cells to the header row
  headerRow.appendChild(activityHeader);
  headerRow.appendChild(intensityHeader);
  headerRow.appendChild(durationHeader);
  headerRow.appendChild(entryDateHeader);
  headerRow.appendChild(deleteHeader);
  // Append the header row to the table header
  thead.appendChild(headerRow);
  // Create a new row for each exercise
  data.forEach((row) => {
    // Create row
    const tr = document.createElement('tr');
    tr.id = `exercise_id=${row.exercise_id}`;
    // Create cells
    const activityTd = document.createElement('td');
    const intensityT = document.createElement('td');
    const durationTd = document.createElement('td');
    const entryDateTd = document.createElement('td');
    const deleteTd = document.createElement('td');
    // insert user data into the cells
    activityTd.innerText = row.activity;
    intensityT.innerText = row.intensity;
    durationTd.innerText = row.duration + ' min';
    entryDateTd.innerText = formatDate(convertDate(row.entry_date));
    // Add a button to delete row
    const deleteButton = document.createElement('button');
    deleteButton.className = 'del';
    deleteButton.setAttribute('data-id', row.exercise_id);
    deleteButton.innerText = 'Delete';
    deleteTd.appendChild(deleteButton);
    // Attach a event listener to 'Delete' button
    deleteButton.addEventListener('click', deleteExercise);
    // Append all cells to the row
    tr.appendChild(activityTd);
    tr.appendChild(intensityT);
    tr.appendChild(durationTd);
    tr.appendChild(entryDateTd);
    tr.appendChild(deleteTd);
    // Append the row to table
    tbody.appendChild(tr);
  });
}

// Function to delete exercise from a specific row in the exercise table
async function deleteExercise(evt) {
  // Get the row-specific exercise_id
  const exerciseId = evt.target.attributes['data-id'].value;
  // Form the request body
  const body = { exercise_id: exerciseId };
  // Prompt the user with a confirm alert
  const answer = confirm(`Oletko varma että haluat poistaa aktiviteetin?`);
  if (answer) {
    // After confirm send the DELETE request
    const data = await deleteRequest('/api/exercises', body);
    // Check response for error
    if (!data.error) {
      // Notify the user that request went through
      showSnackbar('darkgreen', 'Exercise deleted');
      // Reload the Exercises table
      displayExercises();
    } else {
      // Notify the user that there was a error
      showSnackbar('crimson', "Exercise couldn't be deleted");
    }
  }
}

// Iterate over the exercise data to determine time spent per intensity and activity
function analyseExercises(data) {
  // Initialize variables
  const activityStats = {};
  const intensityStats = {};
  const total = {}
  // Iterate over each row
  data.forEach((row) => {
    const activity = row.activity;
    const duration = row.duration;
    const intensity = row.intensity;
    // Keep track of total time spent exercising
    if (!total['total']){
      total['total'] = duration
    } else {
      total['total'] +=  duration
    }
    // Keep track time spent per exercise
    if (!activityStats[activity]) {
      activityStats[activity] = duration;
    } else {
      activityStats[activity] += duration;
    }
    // Keep track time spent per intensity level
    if (!intensityStats[intensity]) {
      intensityStats[intensity] = duration;
    } else {
      intensityStats[intensity] += duration;
    }
  });
    // Convert the dictionary into an array of key-value pairs
    const activitiesArray = Object.entries(activityStats);
    const intensityArray = Object.entries(intensityStats)
    // Sort the array based on the values high to low
    activitiesArray.sort((a, b) => b[1] - a[1]);
    intensityArray.sort((a, b) => b[1] - a[1]);
    // Convert the sorted array back into a dictionary
    const sortedActivities = Object.fromEntries(activitiesArray);
    const sortedIntensities = Object.fromEntries(intensityArray);
  return { sortedActivities, sortedIntensities, total };
}

// Insert exercises stats to the document
function displayExerciseStats(stats) {
  // Make sure the target is empty
  const target = document.querySelector('.middle-exercise')
  target.innerHTML = ''
  // Create a div
  const div = document.createElement('div')
  // Add a header for the first section
  const activitiesHeader = document.createElement('h4')
  activitiesHeader.innerText = 'Time spent on each exercise:'
  div.appendChild(activitiesHeader)

  // Initialize first row font weight - The font weight decreases on every iteration
  let fontWeightCounter = 800;
  // Iterate over every actity type
  Object.entries(stats.sortedActivities).forEach(([activity, duration]) => {
    // Create a p element for each activity type row
    let p = document.createElement('p')
    // Use span tags to color the activity name blue
    p.innerHTML = `<span>${activity}:</span> ${duration} minutes`
    p.style.fontWeight = fontWeightCounter;
    div.appendChild(p)  
    // Decrease font weight to a certain point to maintain readability
    if (fontWeightCounter > 600) {
      fontWeightCounter -= 60;
    } 
  });
  // Re-initialize font weight
  fontWeightCounter = 800;
  // Add a header for the second section
  const intensityHeader = document.createElement('h4')
  intensityHeader.innerHTML = '<br>Time spent by intensity:'
  div.appendChild(intensityHeader)
  // Iterate over each intensity level - The font weight decreases on every iteration
  Object.entries(stats.sortedIntensities).forEach(([intensityLevel, duration]) => {
    // Create a p element for each intensity level row
    let p = document.createElement('p')
    // Use span tags to color the intensity level blue
    p.innerHTML = `<span>${intensityLevel}:</span> ${duration} minutes`
    p.style.fontWeight = fontWeightCounter;
    div.appendChild(p) 
    // Decrease font weight to a certain point to maintain readability
    if (fontWeightCounter > 600) {
      fontWeightCounter -= 60;
    }  
  });
  // Append total time spent exercising to the target
  const total = stats.total.total
  let p = document.createElement('p')
  p.innerHTML = `<br>You have spent in total <span>${total} minutes</span> exercising! <br>Thats <span>${Math.round((total / 24) * 100) / 100} hours</span> in total`
  p.style.fontWeight = 600
  // Append everything
  div.appendChild(p)
  target.appendChild(div)  
}

// Get and listen for 'Add a exercise' -form submission
const exerciseForm = document.querySelector('#exercise-form');
exerciseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // Get values from the 'Add exercise' form
  const activity = document.getElementById('activity').value;
  const duration = document.getElementById('duration').value;
  const intensity = document.getElementById('intensity').value;
  // Format data into request body
  const exerciseFormData = {
    activity: activity,
    duration: duration,
    intensity: intensity,
    user_id: localStorage.getItem('user_id'),
    entry_date: getCurrentDate(),
  };
  // Prepare to send request
  postNewExercise(exerciseFormData);
});

// Send and handle POST exercise request
async function postNewExercise(exercise) {
  // Send POST request
  const data = await postRequest('/api/exercises', exercise);
  // Check response for error
  if (!data.error) {
    // Inform the user that exercise post was succesful
    showSnackbar('darkgreen', 'New exercise added!');
  } else {
    // inform the user that there was a error
    showSnackbar('crimson', "New exercise couldn't be added!");
  }
}

// Get and listen for "Hide exercises" -button
const hideExercisesBtn = document.querySelector('#hide_all_exercises');
hideExercisesBtn.style.display = 'none';
hideExercisesBtn.addEventListener('click', clearExercises);

// Get and listen for 'Log out' -button in navbar
const logOutBtn = document.querySelector('#log-out');
logOutBtn.addEventListener('click', logOut);

// Get and listen for 'Log out' -button in mobile view
const mobileLogOutBtn = document.querySelector('#mobile-sign-out');
mobileLogOutBtn.addEventListener('click', logOut);
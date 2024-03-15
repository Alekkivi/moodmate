"use strict";
import "./regular-style.css";
import { fetchData, get } from "./fetch";
import { showSnackbar } from "./snackbar";

// ----------------- Authorization --------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch data
    const data = await get(
      "https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/auth/me"
    );
    const token = localStorage.getItem("token");
    // Check token and userlevel related to token
    if (data.error === "invalid token" || !token) {
      throw new Error("Unauthorized");
    } else {
      // Save data from GET to local storage
      console.log("Page reload getMe", data);
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("username", data.user.username);

      // Update username to landing page
      document.querySelector(
        "#greeting-header"
      ).innerHTML = `Welcome back ${data.user.username}!`;
      document.querySelector("#date-header").innerHTML = formatDate(
        getCurrentDate()
      );
    }
  } catch (error) {
    // Accessing client was unauthorized
    console.error("Error:", error.message);
    window.location.href = "home.html";
  }
});

const updateAccountLinki = document.querySelector(
  "#update-account-text-button"
);
updateAccountLinki.addEventListener("click", createAccountUpdateForm);

function cancelAccountUpdate() {
  console.log("cancel clicked");
  document.querySelector("#update-account-text-button").style.display = "block";
  document.querySelector("#cancel-account-update-button").style.display =
    "none";

  const formContainer = document.querySelector("#update-user-form");
  formContainer.innerHTML = ""; // Clear form contents
  formContainer.classList.remove("container"); // Remove container class
}

function createAccountUpdateForm() {
  document.querySelector("#update-account-text-button").style.display = "none";

  const cancelUpdateBtn = document.querySelector(
    "#cancel-account-update-button"
  );
  cancelUpdateBtn.style.display = "block";
  cancelUpdateBtn.addEventListener("click", cancelAccountUpdate);

  // Creating form elements using DOM manipulation
  const formContainer = document.querySelector("#update-user-form");
  formContainer.classList.add("container");

  // Create elements
  const formTitle = document.createElement("h2");
  formTitle.textContent = "Update account information";
  formContainer.appendChild(formTitle);

  const usernameLabel = document.createElement("label");
  usernameLabel.textContent = "New username";
  formContainer.appendChild(usernameLabel);

  const usernameInput = document.createElement("input");
  usernameInput.setAttribute("type", "text");
  usernameInput.setAttribute("name", "updated-username");
  usernameInput.setAttribute("placeholder", "New username");
  formContainer.appendChild(usernameInput);

  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "New password";
  formContainer.appendChild(passwordLabel);

  const passwordInput = document.createElement("input");
  passwordInput.setAttribute("type", "password");
  passwordInput.setAttribute("name", "updated-password");
  passwordInput.setAttribute("placeholder", "New password");
  formContainer.appendChild(passwordInput);

  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email";
  formContainer.appendChild(emailLabel);

  const emailInput = document.createElement("input");
  emailInput.setAttribute("type", "email");
  emailInput.setAttribute("name", "updated-email");
  emailInput.setAttribute("placeholder", "New email");
  formContainer.appendChild(emailInput);

  const submitButton = document.createElement("button");
  submitButton.setAttribute("type", "submit");
  submitButton.setAttribute("id", "update-account");
  submitButton.textContent = "Update account information";
  formContainer.appendChild(submitButton);

  submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    gatherUpdateFormData();
  });
}

function gatherUpdateFormData() {
  const usernameValue = document.querySelector(
    'input[name="updated-username"]'
  ).value;
  const passwordValue = document.querySelector(
    'input[name="updated-password"]'
  ).value;
  const emailValue = document.querySelector(
    'input[name="updated-email"]'
  ).value;
  const data = {
    username: usernameValue,
    password: passwordValue,
    email: emailValue,
  };
  putUser(data);
}

async function putUser(entry) {
  // Define request
  const url = `https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/users`;
  let token = localStorage.getItem("token");
  const options = {
    method: "PUT",
    headers: {
      Authorization: "Bearer: " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  };
  console.log(options);
  fetchData(url, options).then((data) => {
    if (!data.error) {
      console.log(data);
      showSnackbar("darkgreen", "Account information updated!");
      localStorage.setItem("username", entry.username);
      document.querySelector(
        "#greeting-header"
      ).innerHTML = `Welcome back ${entry.username}!`;
      cancelAccountUpdate();
    } else {
      showSnackbar("crimson", "Couldn't update account!");
    }
  });
}

// Get and listen for "Get entries" -button
const getEntriesBtn = document.querySelector("#get_all_entries");
getEntriesBtn.addEventListener("click", createCardSet);

// Get and listen for "Hide entries" -button
const hideEntriesBtn = document.querySelector("#hide_all_entries");
hideEntriesBtn.style.display = "none";
hideEntriesBtn.addEventListener("click", clearEntries);

// Get and listen for 'Get exercises' -button
const getExercisesBtn = document.querySelector("#get_all_exercises");
getExercisesBtn.addEventListener("click", displayExercises);

// Get and listen for "Hide entries" -button
const hideExercisesBtn = document.querySelector("#hide_all_exercises");
hideExercisesBtn.style.display = "none";
hideExercisesBtn.addEventListener("click", clearExercises);

// Get and listen for 'Log out' -button
const logOutBtn = document.querySelector("#log-out");
logOutBtn.addEventListener("click", logOut);

async function displayExercises() {
  const exercises = await get(
    "https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/exercises"
  );

  if (Object.keys(exercises).length > 0) {
    document.querySelector("#hide_all_exercises").style.display = "inline";
    createExerciseTable(exercises);
    const exerciseAnalysis = analyseExercises(exercises);
    displayExerciseStats(exerciseAnalysis)

  } else {
    showSnackbar("crimson", "No exercises found");
  }
}

// Get the entry form element
const entryForm = document.querySelector("#entry_form");
// Listen for entry form submission
entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  generateNewEntry();
});

function generateNewEntry() {
  console.log("Entry form submitted!");

  const mood = document.getElementById("mood").value;
  const weight = document.getElementById("weight").value;
  const sleep = document.getElementById("sleep").value;
  const notes = document.getElementById("notes").value;

  const entryFormData = {
    mood_color: mood,
    weight: weight,
    notes: notes,
    sleep_hours: sleep,
    user_id: localStorage.getItem("user_id"),
    entry_date: getCurrentDate(),
  };

  console.log("Entry form submitted with:", entryFormData);
  postNewEntry(entryFormData);
}

const exerciseForm = document.querySelector("#exercise-form");

function deleteExercise(evt) {
  console.log("Delete pressed");
  const exerciseId = evt.target.attributes["data-id"].value;
  console.log(evt);

  const data = { exercise_id: exerciseId };
  console.log(data);

  // Define request
  const url = `https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/exercises`;
  let token = localStorage.getItem("token");
  const options = {
    method: "DELETE",
    headers: {
      Authorization: "Bearer: " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  console.log(options);
  const answer = confirm(`Oletko varma että haluat poistaa aktiviteetin?`);
  if (answer) {
    fetchData(url, options).then((data) => {
      console.log(data);
      showSnackbar("darkgreen", "Exercise deleted");
      document.querySelector(`#exercise_id\\=${exerciseId}`).innerHTML = "";
    });
  }
}

function analyseExercises(data) {
  // Initialize variables to save exercise data
  const activityStats = {};
  const intensityStats = {};

  // Create a new row for each user
  data.forEach((row) => {
    const activity = row.activity.toLowerCase();
    const duration = row.duration;
    const intensity = row.intensity;

    // Update activityStats
    if (!activityStats[activity]) {
      activityStats[activity] = duration;
    } else {
      activityStats[activity] += duration;
    }

    // Update intensityStats
    if (!intensityStats[intensity]) {
      intensityStats[intensity] = duration;
    } else {
      intensityStats[intensity] += duration;
    }
  });

  return { activityStats, intensityStats };
}
function createExerciseTable(data) {
  const tbody = document.querySelector(".tbody");
  tbody.innerHTML = "";
  console.log("createExerciseTable", data);

  // Create a new row for each user
  data.forEach((row) => {
    // Create row
    const tr = document.createElement("tr");
    tr.id = `exercise_id=${row.exercise_id}`;
    // Create cells
    const activityTd = document.createElement("td");
    const intensityT = document.createElement("td");
    const durationTd = document.createElement("td");
    const entryDateTd = document.createElement("td");

    const DeleteTd = document.createElement("td");

    // insert user data into the cells
    activityTd.innerText = row.activity;
    intensityT.innerText = row.intensity;
    durationTd.innerText = row.duration;
    entryDateTd.innerText = formatDate(convertDate(row.entry_date));

    // Add a button to delete row
    const deleteButton = document.createElement("button");
    deleteButton.className = "del";
    deleteButton.setAttribute("data-id", row.exercise_id);
    deleteButton.innerText = "Delete";
    DeleteTd.appendChild(deleteButton);

    deleteButton.addEventListener("click", deleteExercise);

    // Append all cells to the row
    tr.appendChild(activityTd);
    tr.appendChild(intensityT);
    tr.appendChild(durationTd);
    tr.appendChild(entryDateTd);
    tr.appendChild(DeleteTd);
    // Append the row to table
    tbody.appendChild(tr);
  });
}

function displayExerciseStats(stats) {

  Object.entries(stats.activityStats).forEach(([activity, duration]) => {
    console.log(`${activity}: ${duration} minutes`);
  });

  Object.entries(stats.intensityStats).forEach(([intensityLevel, duration]) => {
    console.log(`${intensityLevel}: ${duration} minutes`);
  });
  
}

// Listen for the form submission event
exerciseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Exercise form submitted!");

  const activity = document.getElementById("activity").value;
  const duration = document.getElementById("duration").value;
  const intensity = document.getElementById("intensity").value;

  const exerciseFormData = {
    activity: activity,
    duration: duration,
    intensity: intensity,
    user_id: localStorage.getItem("user_id"),
    entry_date: getCurrentDate(),
  };

  console.log("Exercise form submitted with:", exerciseFormData);
  postNewExercise(exerciseFormData);
});

async function postNewExercise(entry) {
  // Define request
  const url = `https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/exercises`;
  let token = localStorage.getItem("token");
  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer: " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  };
  fetchData(url, options).then((data) => {
    if (!data.error) {
      console.log(data);
      showSnackbar("darkgreen", "New exercise added!");
    } else {
      showSnackbar("crimson", "New exercise couldn't be added!");
    }
  });
}

async function postNewEntry(entry) {
  // Define request
  const url = `https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/entries`;
  let token = localStorage.getItem("token");
  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer: " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  };
  fetchData(url, options).then((data) => {
    if (!data.error) {
      console.log(data);
      showSnackbar("darkgreen", "New entry added!");
    } else {
      showSnackbar("crimson", "New entry couldn't be added!");
    }
  });
}

async function putEntry(entry) {
  // Define request
  const url = `https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/entries`;
  let token = localStorage.getItem("token");
  const options = {
    method: "PUT",
    headers: {
      Authorization: "Bearer: " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  };
  fetchData(url, options).then((data) => {
    if (!data.error) {
      console.log(data);
      showSnackbar("darkgreen", "Entry updated!");
      createCardSet();
    } else {
      showSnackbar("crimson", "Couldn't update entry!");
    }
  });
}

// ----------------- Card functions --------------------
// Take a list of entries and create a card for each entry
async function createCardSet() {
  const entries = await get(
    "https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/entries"
  );
  // Unveil 'Hide entries' Button
  hideEntriesBtn.style.display = "inline";

  const entryCount = Object.keys(entries).length;
  if (!entryCount > 0) {
    console.log("No entries found");
    return showSnackbar("crimson", "No entries found");
  }
  console.log(entryCount, "Entries found");

  // Make sure the target area is empty
  const entriesContainer = document.querySelector(".right-diary");
  entriesContainer.innerHTML = "";

  // Iterate over every entry
  entries.forEach((row) => {
    // Create and append the card to the container
    entriesContainer.appendChild(createSingleCard(row));
  });
}

// Using entry data create a card element
function createSingleCard(entry) {
  // Create card element and add a id to it
  const card = document.createElement("div");
  card.classList.add("card");
  card.id = entry.entry_id;

  // Save the data from the entry to variables
  const entryId = entry.entry_id;
  const moodColor = entry.mood_color;
  const weight = entry.weight;
  const notes = entry.notes;
  const sleepHours = entry.sleep_hours;
  const date = convertDate(entry.entry_date);

  // Create the mood color element
  const moodColorElement = document.createElement("div");
  moodColorElement.classList.add("mood-colour");
  moodColorElement.id = "trigger";

  // Make sure there is a valid color in the database
  try {
    moodColorElement.style.backgroundColor = moodColor;
  } catch (error) {
    console.log("Incorrect entry mood color");
    moodColorElement.style.backgroundColor = "pink";
  }

  // Div for two option buttons
  const entryOptionsDiv = document.createElement("div");
  entryOptionsDiv.classList.add("entry-options");

  // Button to delete entry
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = "X";
  deleteButton.classList.add("delete-button");
  deleteButton.setAttribute("data-id", entryId);

  // Add a event listener for each card
  deleteButton.addEventListener("click", function (evt) {
    deleteEntry(evt, entryId);
  });

  const editButton = document.createElement("button");
  editButton.innerHTML = "Edit";
  editButton.classList.add("entry-button");
  editButton.setAttribute("data-id", entryId);

  editButton.addEventListener("click", function (evt) {
    editEntry(date, entryId);
  });

  // insert diary information into the card
  const h4Element = document.createElement("h4");
  h4Element.textContent = formatDate(date);

  const cardDiaryElement = document.createElement("div");
  cardDiaryElement.classList.add("card-diary");

  const weightP = document.createElement("p");
  weightP.textContent = `Weight: ${weight}`;

  const sleepHoursP = document.createElement("p");
  sleepHoursP.textContent = `Sleep hours: ${sleepHours}`;

  const notesh5 = document.createElement("h");
  notesh5.textContent = `Notes`;

  const notesDiv = document.createElement("div");
  const notesP = document.createElement("p");
  notesDiv.classList.add("card-notes-section");
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

// --------------- Built-in card button functions -------------------
// Delete chosen entry and card
async function deleteEntry(evt, entryId) {
  let token = localStorage.getItem("token");

  // Get date of the correct card on which the button was pressed
  const entryIdToDelete = evt.target.attributes["data-id"].value;
  const entryCard = document.getElementById(entryId);

  // Define request
  const url = `https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/entries/`;
  const data = {
    entry_id: entryIdToDelete,
  };
  console.log(data);
  const options = {
    method: "DELETE",
    headers: {
      Authorization: "Bearer: " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const answer = confirm(`Oletko varma poistosta`);
  if (answer) {
    fetchData(url, options).then((data) => {
      // delete was confirmed
      entryCard.innerHTML = "";
      console.log(options);
      console.log(data);
      if (!data.error) {
        showSnackbar("darkgreen", "Entry deleted!");
      } else {
        showSnackbar("crimson", "Couldn't delete entry!");
      }
    });
  }
}

function editEntry(date, entryId) {
  console.log("Edit painettu", date);
  const div = createUpdateForm(date, entryId);
  const leftBottomDiary = document.querySelector(".bottom-left-diary");
  leftBottomDiary.innerHTML = "";
  leftBottomDiary.appendChild(div);
}

function createUpdateForm(date, entryId) {
  const h3 = document.createElement("h3");
  h3.innerHTML = `Currently modifying entry from: ${formatDate(date)}`;

  // Create form
  const div = document.createElement("div");
  div.classList.add("container");
  div.appendChild(h3);
  const form = document.createElement("form");
  div.id = "modify-entry-form";
  form.id = "entry_form";
  form.setAttribute("method", "post");
  form.setAttribute("id", "entry_form");

  // Create label and select for mood
  const moodLabel = document.createElement("label");
  moodLabel.setAttribute("for", "mood");
  moodLabel.textContent = `Update color`;
  form.appendChild(moodLabel);

  const moodSelect = document.createElement("select");
  moodSelect.setAttribute("id", "mood");
  moodSelect.setAttribute("name", "mood");
  ["Red", "Orange", "Yellow", "Green"].forEach(function (color) {
    const option = document.createElement("option");
    option.setAttribute("value", color);
    option.textContent = color;
    moodSelect.appendChild(option);
  });
  form.appendChild(moodSelect);

  // Create label and input for weight
  const weightLabel = document.createElement("label");
  weightLabel.setAttribute("for", "weight");
  weightLabel.textContent = "Weight (kg):";
  form.appendChild(weightLabel);

  const weightInput = document.createElement("input");
  weightInput.setAttribute("type", "number");
  weightInput.setAttribute("id", "weight");
  weightInput.setAttribute("name", "weight");
  weightInput.setAttribute("step", "0.1");
  weightInput.setAttribute("placeholder", "Enter your weight");
  weightInput.required = true;
  form.appendChild(weightInput);

  // Create label and input for sleep
  const sleepLabel = document.createElement("label");
  sleepLabel.setAttribute("for", "sleep");
  sleepLabel.textContent = "Sleep hours:";
  form.appendChild(sleepLabel);

  const sleepInput = document.createElement("input");
  sleepInput.setAttribute("type", "number");
  sleepInput.setAttribute("id", "sleep");
  sleepInput.setAttribute("name", "sleep");
  sleepInput.setAttribute("step", "0.1");
  sleepInput.setAttribute("placeholder", "Enter your sleep hours");
  sleepInput.required = true;
  form.appendChild(sleepInput);

  // Create label and textarea for notes
  const notesLabel = document.createElement("label");
  notesLabel.setAttribute("for", "notes");
  notesLabel.textContent = `Update description`;
  form.appendChild(notesLabel);

  const notesTextarea = document.createElement("textarea");
  notesTextarea.setAttribute("id", "notes");
  notesTextarea.setAttribute("name", "notes");
  notesTextarea.setAttribute("rows", "8");
  notesTextarea.setAttribute("placeholder", "Enter additional notes");
  notesTextarea.style.resize = "none";
  notesTextarea.setAttribute("maxlength", "250");
  form.appendChild(notesTextarea);

  // Create submit button
  const submitButton = document.createElement("button");
  submitButton.setAttribute("type", "submit");
  submitButton.setAttribute("id", "entry_submit");
  submitButton.textContent = "Update diary entry";
  form.appendChild(submitButton);

  // Create cancel button
  const cancelButton = document.createElement("button");
  cancelButton.setAttribute("type", "button"); // Change 'click' to 'button'
  cancelButton.setAttribute("id", "cancel");
  cancelButton.textContent = "Cancel";
  form.appendChild(cancelButton); // Append the cancel button to the form

  // Add event listener to the form
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateEntry(date, entryId);
  });

  // Add event listener to the cancel button
  cancelButton.addEventListener("click", (event) => {
    event.preventDefault();
    cancelUpdateEntry();
  });

  div.append(form);

  return div;
}

function updateEntry(date, entryId) {
  const mood = document.getElementById("mood").value;
  const weight = document.getElementById("weight").value;
  const sleep = document.getElementById("sleep").value;
  const notes = document.getElementById("notes").value;

  const entryFormData = {
    entry_id: entryId,
    mood_color: mood,
    weight: weight,
    notes: notes,
    sleep_hours: sleep,
    user_id: localStorage.getItem("user_id"),
    entry_date: date,
  };
  console.log("update entry:", entryFormData);
  putEntry(entryFormData);
  replaceEditEntryForm();
}

function replaceEditEntryForm() {
  const bottomLeftDiary = document.querySelector(".bottom-left-diary");
  bottomLeftDiary.innerHTML = "";
  // Create container div
  const container = document.createElement("div");
  container.className = "container";
  container.id = "diary-container";

  // Create h1
  const h1 = document.createElement("h1");
  h1.textContent = "Create a diary entry";
  container.appendChild(h1);

  // Create form
  const form = document.createElement("form");
  form.method = "post";
  form.id = "entry_form";

  // Create label and select for mood
  let label = document.createElement("label");
  label.htmlFor = "mood";
  label.textContent = "Pick a color to represent your day: ";
  form.appendChild(label);

  const select = document.createElement("select");
  select.id = "mood";
  select.name = "mood";
  ["Red", "Orange", "Yellow", "Green"].forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    select.appendChild(option);
  });
  form.appendChild(select);

  // Create label and input for weight
  label = document.createElement("label");
  label.htmlFor = "weight";
  label.textContent = "Weight (kg):";
  form.appendChild(label);

  let input = document.createElement("input");
  input.type = "number";
  input.id = "weight";
  input.name = "weight";
  input.step = "0.1";
  input.placeholder = "Enter your weight";
  input.required = true;
  form.appendChild(input);

  // Create label and input for sleep
  label = document.createElement("label");
  label.htmlFor = "sleep";
  label.textContent = "Sleep hours:";
  form.appendChild(label);

  input = document.createElement("input");
  input.type = "number";
  input.id = "sleep";
  input.name = "sleep";
  input.step = "0.1";
  input.placeholder = "Enter your sleep hours";
  input.required = true;
  form.appendChild(input);

  // Create label and textarea for notes
  label = document.createElement("label");
  label.htmlFor = "notes";
  label.textContent = "Describe your day:";
  form.appendChild(label);

  const textarea = document.createElement("textarea");
  textarea.id = "notes";
  textarea.name = "notes";
  textarea.rows = "8";
  textarea.placeholder = "Enter additional notes";
  textarea.style.resize = "none";
  textarea.maxLength = "250";
  form.appendChild(textarea);

  // Create submit button
  const button = document.createElement("button");
  button.type = "submit";
  button.id = "entry_submit";
  button.textContent = "Create diary entry";
  form.appendChild(button);

  // Add event listener to the form
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generateNewEntry();
    createCardSet();
  });
  // Append form to container
  container.appendChild(form);

  // Append container to body (or wherever you want to append it)
  bottomLeftDiary.appendChild(container);
}

// --------------- Date functions -------------------
// Format date "yyyy-mm-ddT22:00:00.000Z" ---> "yyyy-mm-dd"
function convertDate(dateString) {
  // Parse the input date string
  const date = new Date(dateString);
  // Add one day
  date.setDate(date.getDate());
  // Get the year, month, and day components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // Format the date to yyyy-mm-dd
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

// Reformat dates from yyyy-mm-dd to dd.mm.yyyy
function formatDate(dateString) {
  // Parse the input date string
  const date = new Date(dateString);
  // Adjust the date to GMT+2 time zone
  const gmtPlus2Date = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  // Extract day, month, and year
  const day = gmtPlus2Date.getDate();
  const month = gmtPlus2Date.getMonth() + 1; // Month is zero-based, so add 1
  const year = gmtPlus2Date.getFullYear();
  // Format the date as "dd-mm-yyyy"
  const formattedDate = `${day < 10 ? "0" : ""}${day}.${
    month < 10 ? "0" : ""
  }${month}.${year}`;
  return formattedDate;
}

// Get current date in "yyyy-mm-dd" -format
function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because January is 0-indexed
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// --------------- Clear entries -------------------
// Clear entries element
function clearEntries() {
  // Find the element and make sure to overwrite it
  const target = document.querySelector(".right-diary");
  target.innerHTML = "";
  hideEntriesBtn.style.display = "None";
}

function clearExerciseStats() {
  const statsTarget = document.querySelector(".exercise-stats-target");
  statsTarget.innerHTML = "";
}

function clearExercises() {
  console.log("Pressed");
  clearExerciseStats();
  document.querySelector(".tbody").innerHTML = "";
  hideExercisesBtn.style.display = "None";
}

// ------------------------ Log out -------------------------
function logOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
  // console.log('Everything should be removed');
  window.location.href = "home.html";
}

function cancelUpdateEntry() {
  replaceEditEntryForm();
}

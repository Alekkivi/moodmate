import { get, deleteRequest } from "./fetch.js";
import { convertDate, convertDate2, formatDate } from "./date-functions.js";
import { showSnackbar } from "./snackbar.js";
import { deleteEntry } from "./delete-card.js";
import "./universal-styles.css";
import "./admin-style.css";
import { logOut } from "./log-out.js";
import {
  clearUsersForAdmin,
  clearEntriesForAdmin,
} from "./clear-element-functions.js";

// ----------------- Authorization --------------------
// Redirect unauthorized clients to index.html
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await get('/api/auth/me')

    // // Define request
    const token = localStorage.getItem("token");
    // Check token and userlevel related to token
    if (
      data.error === "invalid token" ||
      data.user.user_level !== "admin" ||
      !token
    ) {
      throw new Error("Unauthorized");
    } else {
      // Update authorized username to the banner
      document.getElementById("name").innerHTML = data.user.username;
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("username", data.user.username);
    }
  } catch (error) {
    // Accessing client was unauthorized
    window.location.href = "home.html";
  }
});
// ----------------- Button listeners --------------------
// Listen for 'Get users' -button
const allUsersButton = document.querySelector(".get_users");
allUsersButton.addEventListener("click", getUsers);
// Listen for 'Hide entries' -button
const hideAllentries = document.querySelector("#hide_all_entries");
hideAllentries.addEventListener("click", clearEntriesForAdmin);
hideAllentries.style.display = "none";
// Listen for 'Hide users' -button
const hideAllUsers = document.querySelector("#hide_all_users");
hideAllUsers.addEventListener("click", clearUsersForAdmin);
hideAllUsers.style.display = "none";
// Listen for navbar 'log out'-button
const navLogOut = document.querySelector(".navigation a");
navLogOut.addEventListener("click", logOut);


// ----------------- GET functions --------------------
// Get all users from the database
async function getUsers() {
  console.log("Fetching all users from server");
  const data = await get("/api/users")
  // Calculate the lenght of the response
  const userCount = Object.keys(data).length;
  // Check for error in response
  if (!data.error) {
    // Display 'Hide users'-button
    document.querySelector("#hide_all_users").style.display = "inline";
    // Create a table containing all users
    createTable(data)
  } else {
    // Display the error message from the response
    showSnackbar('Crimson', data.message)
  }
}

// Get entries using user id from all users table
async function getUserEntries(evt) {
  // Get User ID from the specific row
  const id = evt.target.getAttribute("data-id");
  console.log(`Accessing all entries with user_id=${id}`);    
  // Clear out card target section
  document.querySelector("#entry_target").innerHTML = "";

  // Form the request
  const data = await get(`/api/entries/${id}`)
  // Check for error in response
  if (!data.error) {
    console.log("getUserEntries", data);
    // Call function to create cards for each entry
    createCardSet(data);
  } else {
      //No entries were found
      showSnackbar('darkgray', `No entries found with User ID = ${id}`);
  }
}

// Get detailed user info using table rows
async function getUserInfo(evt) {

  // Get User ID from the specific row
  const id = evt.target.getAttribute("data-id");
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
  const modal = document.querySelector("dialog");
  const div = document.getElementById("modal_target");
  div.innerHTML = "";

  // Iterate over rows of user data
  for (let key in userData) {
    let value = userData[key];
    // Check for 'Username' -row to set it as a header for the model
    if (key === "Username") {
      let h3 = document.createElement("h3");
      h3.innerText = value;
      div.appendChild(h3);
    // Check for 'Created at' -row to format the date
    } else if (key === "Created at") {
      let p = document.createElement("p");
      p.innerHTML = `<span>${key}:</span> ${formatDate(convertDate(value))}`;
      div.appendChild(p);
    // Append the rest of the rows as P -elements
    } else {
      let p = document.createElement("p");
      p.innerHTML = `<span>${key}:</span> ${value}`;
      div.appendChild(p);
    }
  }
  // Append div to modal
  modal.appendChild(div);

  // Create and append a 'Close' -button for the modal
  let closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  div.appendChild(closeButton);
  // Attach a event listener to close the modal
  closeButton.addEventListener('click', () => {
    modal.close()
  })
  // Display modal
  modal.showModal();
}


// ----------------- DELETE functions --------------------
async function deleteUser(evt) {
  // Get User ID from the specific row
  const id = evt.target.attributes["data-id"].value;
  // Get the User ID of current logged in user
  const currentId = localStorage.getItem("user_id");
  // Check if the selected row is current logged in user
  if (id == currentId) {
    // Logged in user chose their own account to be deleted
    showSnackbar("crimson", "You cant delete your own account");
    return;
  } else {
    // Ask for confirmation to send the request
    const answer = confirm(
      `Oletko varma että haluat poistaa käyttäjän ID: ${id} `
    );
    // Check if user proceeded with the process
    if (answer) {
      let token = localStorage.getItem("token");

      // Send a request to delete every Exercise entry 
      deleteRequest(`/api/exercises/${id}`,token);
      // Send a request to delete every Diary entry
      deleteRequest(`/api/entries/${id}`, token);
      // Send a request to delete the chosen user
      const response = deleteRequest(`/api/users/${id}`, token)
      if (!response.error){
        getUsers();
      } else {
        showSnackbar('crimson', response.message)
      }
    }
  }
}

// Create a new table based on parameters
function createTable(data) {
  // Find the element and make sure to overwrite it
  const table = document.querySelector(".styled-table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  // Clear existing headers and rows
  thead.innerHTML = "";
  tbody.innerHTML = "";

  // Create header row
  const headerRow = document.createElement("tr");

  // Define header titles
  const headers = [
    "User Name",
    "User Level",
    "Info",
    "Delete",
    "User ID",
    "Entries",
  ];

  // Create header cells and append to header row
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  // Append header row to the table header
  thead.appendChild(headerRow);

  // Create a new row for each user
  data.forEach((row) => {
    // Create row
    const tr = document.createElement("tr");

    // Create cells
    const usernameTd = document.createElement("td");
    const userLevelTd = document.createElement("td");
    const infoButtonTd = document.createElement("td");
    const deleteTd = document.createElement("td");
    const userIdTd = document.createElement("td");
    const getEntriesTd = document.createElement("td");

    // Insert user data into the cells
    usernameTd.innerText = row.username;
    userLevelTd.innerText = row.user_level;
    userIdTd.innerText = row.user_id;

    // Add a button to see user information
    const infoButton = document.createElement("button");
    infoButton.className = "check";
    infoButton.setAttribute("data-id", row.user_id);
    infoButton.innerText = "Info";
    infoButtonTd.appendChild(infoButton);

    // Add a button to delete user and row
    const deleteButton = document.createElement("button");
    deleteButton.className = "del";
    deleteButton.setAttribute("data-id", row.user_id);
    deleteButton.innerText = "Delete";
    deleteTd.appendChild(deleteButton);

    // Add a button to get all user entries
    const getEntriesButton = document.createElement("button");
    getEntriesButton.className = "check";
    getEntriesButton.setAttribute("data-id", row.user_id);
    getEntriesButton.innerText = "Get all entries";
    getEntriesTd.appendChild(getEntriesButton);

    // Listen for button clicks
    infoButton.addEventListener("click", getUserInfo);
    getEntriesButton.addEventListener("click", getUserEntries);
    deleteButton.addEventListener("click", deleteUser);

    // Append all cells to the row
    tr.appendChild(usernameTd);
    tr.appendChild(userLevelTd);
    tr.appendChild(infoButtonTd);
    tr.appendChild(deleteTd);
    tr.appendChild(userIdTd);
    tr.appendChild(getEntriesTd);

    // Append the row to table body
    tbody.appendChild(tr);
  });
}


// Fill a section with induvidually created cards
async function createCardSet(entries) {
  // Check how many entries the parameter variable contains
  const entryCount = Object.keys(entries).length;
  if (entryCount === 0) {
    // Inform the user that no entries were found
    showSnackbar("crimson", "No entries found");
    return;
  } else {
    showSnackbar('darkgreen', `${entryCount} entries found` )
    // Display 'Hide entries' -button
    document.querySelector("#hide_all_entries").style.display = "inline";

    // Make sure the target area is empty
    const entriesContainer = document.querySelector("#entry_target");
    entriesContainer.innerHTML = "";

    // Iterate over every entry
    entries.forEach((row) => {
      // Create and append the card to the container
      entriesContainer.appendChild(createSingleCard(row));
    });
  }
}

// Using entry data create a card element
function createSingleCard(entry) {
  // Create card element and add a id to it
  const card = document.createElement("div");
  card.classList.add("card");
  card.id = entry.entry_id;
  const entryId = entry.entry_id;

  // Create the mood color element
  const moodColorElement = document.createElement("div");
  moodColorElement.classList.add("mood-colour");
  moodColorElement.id = "trigger";
  moodColorElement.style.backgroundColor = entry.mood_color;

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

  // insert diary information into the card
  const h4Element = document.createElement("h4");
  h4Element.textContent = convertDate(entry.entry_date);

  const cardDiaryElement = document.createElement("div");
  cardDiaryElement.classList.add("card-diary");

  const userIdP = document.createElement("p");
  userIdP.textContent = `User ID: ${entry.user_id}`;

  const entryIdP = document.createElement("p");
  entryIdP.textContent = `Entry ID: ${entry.entry_id}`;

  const timeStampP = document.createElement("p");
  timeStampP.textContent = `Created at: ${convertDate(entry.entry_date)}`;

  const weightP = document.createElement("p");
  weightP.textContent = `Weight: ${entry.weight}`;

  const sleepHoursP = document.createElement("p");
  sleepHoursP.textContent = `Sleep hours: ${entry.sleep_hours}`;

  const notesh5 = document.createElement("h5");
  notesh5.textContent = `Notes`;

  const notesDiv = document.createElement("div");
  const notesP = document.createElement("p");
  notesDiv.classList.add("card-notes-section");
  notesP.textContent = entry.notes;
  notesDiv.appendChild(notesP);

  // Append card header elements
  entryOptionsDiv.appendChild(deleteButton);
  moodColorElement.appendChild(h4Element);
  moodColorElement.appendChild(entryOptionsDiv);

  // Append all text rows to card body
  cardDiaryElement.appendChild(userIdP);
  cardDiaryElement.appendChild(entryIdP);
  cardDiaryElement.appendChild(timeStampP);
  cardDiaryElement.appendChild(weightP);
  cardDiaryElement.appendChild(sleepHoursP);
  cardDiaryElement.appendChild(notesh5);
  cardDiaryElement.appendChild(notesDiv);

  // Append mood color and card body to card
  card.appendChild(moodColorElement);
  card.appendChild(cardDiaryElement);
  return card;
}

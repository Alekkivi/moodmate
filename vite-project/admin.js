import { fetchData } from "./fetch.js";
import "./admin-style.css"


// ----------------- Authorization --------------------
// Redirect unauthorized clients to index.html
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Define request
    const url = "http://localhost:3000/api/auth/me";
    const token = localStorage.getItem("token");
    const options = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    };
    // Fetch data
    const data = await fetchData(url, options);
    // Check token and userlevel related to token
    if (data.error === "invalid token" || data.user.user_level !== "admin") {
      throw new Error("Unauthorized");
    }
    // Update authorized username to the banner
    document.getElementById("name").innerHTML = data.user.username;
  } catch (error) {
    // Accessing client was unauthorized
    console.error("Error:", error.message);
    window.location.href = "index.html";
  }
});


// ----------------- Button listeners --------------------
// Listen for 'Get users' -button
const allUsersButton = document.querySelector(".get_users");
allUsersButton.addEventListener("click", getUsers);
// Listen for 'Hide entries' -button
const hideAllentries = document.querySelector("#hide_all_entries");
hideAllentries.addEventListener("click", clearEntries);
// Listen for 'Hide users' -button
const hideAllUsers = document.querySelector("#hide_all_users");
hideAllUsers.addEventListener("click", clearUsers);
// Listen for navbar logo
const navHome = document.querySelector('.logo')
navHome.addEventListener('click', logOut) /// MITÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
// Listen for navbar 'log out'-button
const navLogOut = document.querySelector('.navigation a')
navLogOut.addEventListener('click',logOut)
// Listen for in-dialog 'cancel' buttons
const dialog = document.querySelector('dialog')
const closeButton = document.querySelector('dialog button')
closeButton.addEventListener('click', () =>{
  dialog.close()
})


// ----------------- GET functions --------------------
// Get all users
async function getUsers() {
  console.log("Fetching all users from server");
  // Get the authorization token from local storage
  let token = localStorage.getItem("token");

  // Define request
  const url = "http://127.0.0.1:3000/api/users";
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer: " + token,
    },
  };
  // Fetch data
  fetchData(url, options).then((data) => {
    // Build a new table using response data
    createTable(data);
  });
}


// Get entries using user id from all users table
async function getUserEntries(evt) {
  // Get the user id from the specific row
  const id = evt.target.getAttribute("data-id");
  console.log(`Accessing all entries: user_id = ${id}`);

  // Get the authorization token from local storage
  const token = localStorage.getItem("token");
  // Define request
  const url = `http://127.0.0.1:3000/api/entries/${id}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  };
  // Fetch user data and handle the response
  fetchData(url, options)
    .then((data) => {
      // Found entries
      if (!data.error) {
        console.log("Entries found");
        // Call function to create cards for each entry
        createCardSet(data)
        // There was a error or no entries found
      } else {
        showSnackbar(data.error)
        console.log(data);
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      showSnackbar(error)
    });
}

// Get user info based on the clicked row in the all users table
async function getUserInfo(evt) {
  // Get the user id from the specific row
  const id = evt.target.getAttribute("data-id");
  console.log(`Accessing user info: user_id = ${id}`);

  // Get the authorization token from local storage
  const token = localStorage.getItem("token");
  // Define request
  const url = `http://127.0.0.1:3000/api/users/${id}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  };
  // Fetch user data and handle the response
  fetchData(url, options)
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

// ----------------- DELETE functions --------------------
async function deleteUser(evt) {
  console.log("Deletoit tietoa");
  console.log(evt);

  // Tapa 1, haetaan arvo tutkimalla eventtiä
  const id = evt.target.attributes["data-id"].value;
  console.log(id);

  // Define request
  const url = `http://127.0.0.1:3000/api/users/${id}`;
  let token = localStorage.getItem("token");
  const options = {
    method: "DELETE",
    headers: {
      Authorization: "Bearer: " + token,
    },
  };
  const answer = confirm(
    `Oletko varma että haluat poistaa käyttäjän ID: ${id} `
  );
  if (answer) {
    fetchData(url, options).then((data) => {
      console.log(data);
      getUsers();
    });
  }
}

// Delete chosen entry/card
async function deleteEntry(evt, entryId){
  let token = localStorage.getItem("token");

  // Get date of the correct card on which the button was pressed
  const entryToDelete = evt.target.attributes["data-id"].value;
  const entryCard = document.getElementById(entryId)

  // Define request
    const url = `http://127.0.0.1:3000/api/entries/`;
    const data = {
      entry_date: convertDate(entryToDelete)
    };
    console.log(data)
    const options = {
      method: "DELETE",
      headers: {
        Authorization: "Bearer: " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    };
    const answer = confirm(
      `Oletko varma poistosta`
    );
    if (answer) {
      fetchData(url, options).then((data) => {
        // delete was confirmed
        entryCard.innerHTML = ''
        console.log(data);
        showSnackbar(data.message)
       });
    }
}
 
// ----------------- Generate UI --------------------
// Create a new table based on parameters
function createTable(data) {
  // Find the element and make sure to overwrite it
  const tbody = document.querySelector(".tbody");
  tbody.innerHTML = "";

  // Create a new row for each user
  data.forEach((row) => {
    // Create row
    const tr = document.createElement("tr");
    // Create cells
    const usernameTd = document.createElement("td");
    const userLevelTd = document.createElement("td");
    const infoButtonTd = document.createElement("td");
    const DeleteTd = document.createElement("td");
    const userIdTd = document.createElement("td");
    const getEntriesTd = document.createElement("td");

    // insert user data into the cells
    usernameTd.innerText = row.username;
    userLevelTd.innerText = row.user_level;
    userIdTd.innerText = row.user_id;

    // Add a button to see user information
    const infoButton = document.createElement("button");
    infoButton.className = "check";
    infoButton.setAttribute("data-id", row.user_id);
    infoButton.innerText = "Info";
    infoButtonTd.appendChild(infoButton);

    // Listen for 'info' -button event
    infoButton.addEventListener('click', () =>{
        // Display modal
        dialog.showModal()
        // Insert row specific userdata into the modal
        dialog.querySelector('p').innerHTML = `
        <div>UserID: ${row.user_id}</div>
        <div>Username: ${row.username}</div>
        <div>Email: ${row.email}</div>
        <div>Role: ${row.user_level}</div> 
        <div>Created at: ${formatDate(row.created_at)}</div>
        <div><br>${row.username} has ${row.diary_entry_count} entries</div>
        <div>${row.username} has ${row.monthly_average_count} monthly averages`
      });

    // Add a button to delete user and row
    const deleteButton = document.createElement("button");
    deleteButton.className = "del";
    deleteButton.setAttribute("data-id", row.user_id);
    deleteButton.innerText = "Delete";
    DeleteTd.appendChild(deleteButton);

    // Add a button to delete user and row
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
    tr.appendChild(DeleteTd);
    tr.appendChild(userIdTd);
    tr.appendChild(getEntriesTd);
    // Append the row to table
    tbody.appendChild(tr);
  });
}


// Take a list of entries and create a card for each entry
function createCardSet(entries) {
  // Make sure the target area is empty
  const entriesContainer = document.querySelector('#entry_target');
  // entriesContainer.style.display = 'flex'
  entriesContainer.innerHTML = ""

  // Iterate over every entry
  entries.forEach((row) => {
    // Create card
    const card = document.createElement('div');
    card.classList.add('card');
    card.id = row.entry_id

    // Save the data from the entry to variables
    const entryId = row.entry_id;
    const userId = row.user_id;
    const moodColor = row.mood_color;
    const weight = row.weight;
    const notes = row.notes;
    const sleepHours = row.sleep_hours;
    const rawDate = row.entry_date;
    const readableDate = formatDate(rawDate)
    
    // Create the mood color element
    const moodColorElement = document.createElement('div');
    moodColorElement.classList.add('mood-colour');
    moodColorElement.id = 'trigger';

    moodColorElement.style.backgroundColor = moodColor

    // Div for two option buttons
    const entryOptionsDiv = document.createElement('div');
    entryOptionsDiv.classList.add('entry-options');

    // Button to delete entry
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.classList.add('entry-button')

    // Add a event listener for each card
    deleteButton.setAttribute("data-id", rawDate);
    deleteButton.addEventListener("click", function(evt) {
      deleteEntry(evt, entryId);
    });
    // insert diary information into the card
    const h4Element = document.createElement('h4');
    h4Element.textContent = readableDate;

    const cardDiaryElement = document.createElement('div');
    cardDiaryElement.classList.add('card-diary');

    const entryIdP = document.createElement('p');
    entryIdP.textContent = `Entry id: ${entryId}`;

    const userIdP = document.createElement('p');
    userIdP.textContent = `User id: ${userId}`;

    const weightP = document.createElement('p');
    weightP.textContent = `Weight: ${weight}`;

    const createdAtP = document.createElement('p');
    createdAtP.textContent = `Created at: ${readableDate}`;

    const notesP = document.createElement('p');
    notesP.textContent = `Notes: ${notes}`;

    const sleepHoursP = document.createElement('p');
    sleepHoursP.textContent = `Sleep hours: ${sleepHours}`;

    // Append card header elements
    entryOptionsDiv.appendChild(deleteButton);
    moodColorElement.appendChild(h4Element);
    moodColorElement.appendChild(entryOptionsDiv);

    // Append all text rows to card body
    cardDiaryElement.appendChild(entryIdP);
    cardDiaryElement.appendChild(userIdP);
    cardDiaryElement.appendChild(weightP);
    cardDiaryElement.appendChild(createdAtP);
    cardDiaryElement.appendChild(notesP);
    cardDiaryElement.appendChild(sleepHoursP);

    // Append mood color and card body to card
    card.appendChild(moodColorElement);
    card.appendChild(cardDiaryElement);

    // Append the card to the container
    entriesContainer.appendChild(card);
  });
}

// Reformat dates from the server to more readable form
function formatDate(dateString) {
  // Parse the input date string
  const date = new Date(dateString);
  // Adjust the date to GMT+2 time zone
  const gmtPlus2Date = new Date(date.getTime() + (2 * 60 * 60 * 1000));
  // Extract day, month, and year
  const day = gmtPlus2Date.getDate();
  const month = gmtPlus2Date.getMonth() + 1; // Month is zero-based, so add 1
  const year = gmtPlus2Date.getFullYear();
  // Format the date as "dd-mm-yyyy"
  const formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
  return formattedDate;
}

// Show snackbar
function showSnackbar(action) {
  const x = document.getElementById("create-bad-login-snackbar")
  x.innerHTML = action
  if (!x.classList.contains("show")) {
    x.classList.add("show");
    setTimeout(function () {
      x.classList.remove("show");
    }, 3000);
  }
}

function convertDate(dateString) {
  const [day, month, year] = dateString.split('.');
  const convertedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return convertedDate;
}


// --------------- Clear element functions -------------------
// Clear entries element
function clearEntries() {
  // Find the element and make sure to overwrite it
  const target = document.querySelector("#entry_target");
  target.innerHTML = "";
}
// Clear users table
function clearUsers() {
  // Find the element and make sure to overwrite it
  const target = document.querySelector(".tbody");
  target.innerHTML = "";
}


// ------------------------ Log out -------------------------
function logOut(){
  localStorage.removeItem('token');
  window.location.href = "index.html";
}



import { showSnackbar } from "./snackbar.js";
import { fetchData } from "./fetch.js";
import "./universal-styles.css"
import "./auth-style.css"
'use strict'

// Get and listen for 'Login' -button
const loginUser = document.querySelector(".loginuser");
loginUser.addEventListener("click", async (evt) => {
  const form = document.querySelector(".login_form");
  evt.preventDefault();

  // Input validation
  if (!form.checkValidity()) {
    console.log('väärrää')
    // If validation failed display a generic error message
    showSnackbar('Crimson', 'Incorrect username or password');
    return;
  }
  // If input passed validation - continue to collect data from the 'Log in' -form 
  const endpoint = "/api/auth/login";
  const data = {
    username: form.querySelector("input[name=username]").value,
    password: form.querySelector("input[name=password]").value,
  };
  // Define the request
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body data type must match "Content-Type" header
    body: JSON.stringify(data),
  };
  // Send request and handle response
  fetchData(endpoint, options).then((data) => {
    // Failed login will produce a undefined token
    if (data.token == undefined) {
      // Log in failed - show snackbar
      showSnackbar('Crimson', 'Incorrect username or password');
    } else {
      // Log in was successful - Get user level from response
      const userLevel = data.user.user_level;
      // Save token from response to local storage
      localStorage.setItem("token", data.token);
      // Direct to new page depending on user level
      if (userLevel === "admin") {
        window.location.href = "admin.html";
      } else if (userLevel === 'regular') {
        window.location.href = 'regular.html';
      }
    }
  });
});

// Get and listen for 'Create account' -button
const createUser = document.querySelector(".createuser");
createUser.addEventListener("click", async (evt) => {
  const form = document.querySelector(".create_user_form");
  evt.preventDefault();
  // Input validation
  if (!form.checkValidity()) {
    form.reportValidity()
    return;
  }
  // If input passed validation - Collect data from the 'Create Account' -form 
  const endpoint = "/api/users";
  const data = {
    username: form.querySelector("input[name=username]").value,
    password: form.querySelector("input[name=password]").value,
    email: form.querySelector("input[name=email]").value,
  };
  // Define the request
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body data type must match "Content-Type" header
    body: JSON.stringify(data),
  };
  // Send request and handle response
  fetchData(endpoint, options).then((data) => {
    // Check response for errors
    if (!data.error) {
      // If no errors occurred, inform user that new account was created
      showSnackbar('darkgreen', 'New user created!');
      // Check if response contains error about taken username
    } else if (data.error === "Username taken") {
      showSnackbar('crimson', 'Username or email already taken');
    } else {
      // Display other error
      showSnackbar("crimson", 'Invalid input');
    }
  });
});
import { fetchData } from "./fetch.js";
import { showSnackbar } from "./snackbar.js";
import "./auth-style.css"


// Get 'Login' -button
const loginUser = document.querySelector(".loginuser");

// Listen for login click
loginUser.addEventListener("click", async (evt) => {
  evt.preventDefault();
  console.log("Login activated");

  const url = "https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/auth/login";
  const form = document.querySelector(".login_form");

  const data = {
    username: form.querySelector("input[name=username]").value,
    password: form.querySelector("input[name=password]").value,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body data type must match "Content-Type" header
    body: JSON.stringify(data),
  };

  // Fetch and handle response
  fetchData(url, options).then((data) => {
    console.log(data);

    if (data.token == undefined) {
      // Log in failed show snackbar
      showSnackbar("incorrectLogin");
    } else {
      // Log in was successful - Get user level from response
      const userLevel = data.user.user_level;
      localStorage.setItem("token", data.token);

      if (userLevel === "admin") {
        console.log("Admin logged in");
        window.location.href = "admin.html";
      } else if (userLevel === 'regular') {
        console.log("Regular logged in");
        window.location.href = 'regular.html';
      }
    }
  });
});

// Get 'Create account' -button
const createUser = document.querySelector(".createuser");
// Listen for Create account click
createUser.addEventListener("click", async (evt) => {
  evt.preventDefault();
  console.log("Create account activated");

  const url = "https://hyte-server-aleksi.northeurope.cloudapp.azure.com/api/users";
  const form = document.querySelector(".create_user_form");

  const data = {
    username: form.querySelector("input[name=username]").value,
    password: form.querySelector("input[name=password]").value,
    email: form.querySelector("input[name=email]").value,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body data type must match "Content-Type" header
    body: JSON.stringify(data),
  };

  fetchData(url, options).then((data) => {
    console.log(data);
    if (!data.error) {
      // Fetch ok!
      showSnackbar('darkgreen', 'New user created!');
      console.log(data);
      // Username already taken
    } else if (data.error === "Username taken") {
      showSnackbar('crimson', data.error);
    } else {
      // Invalid input or other error
      showSnackbar("crimson", data.error);
    }
  });
});


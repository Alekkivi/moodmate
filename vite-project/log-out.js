// Clear items from local storage
function logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    window.location.href = "home.html";
}

export {logOut}
'use strict';
/**
 * Clears user-related items from the local storage and redirects to the home page.
 */
function logOut() {
    // Remove user-related items from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    // Redirect to the home page
    window.location.href = 'index.html';
}
export { logOut };

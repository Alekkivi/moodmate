'use strict';
import "./index-style.css"


// Listen for sign-in button thats displayed in mobile view
const logInBtn = document.querySelector('.sign-in')
logInBtn.addEventListener('click', () => {
    window.location.href = 'auth.html';
})
'use strict';
import './universal-styles.css';
import './index-style.css';


// Listen for sign-in button that's displayed in mobile view
const logInBtn = document.querySelector('.sign-in');
logInBtn.addEventListener('click', () => {
    window.location.href = 'auth.html';
});

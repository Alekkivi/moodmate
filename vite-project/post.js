'use strict';
import { fetchData } from "./fetch";
/**
 * Sends a POST request to the specified API endpoint with the provided token for authorization.
 * @param {string} endpoint - The API endpoint URL.
 * @param {Object} postBody - The body of the POST request in JSON format.
 * @returns {Promise<any>} A promise representing the result of the POST request.
 */
async function postRequest(endpoint, postBody) {
    // Retrieve the token from localStorage
    let token = localStorage.getItem('token');
    // Define request options
    const options = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer: ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody), // Convert postBody to JSON string
    };
    // Send POST request using fetchData function and return the promise
    return fetchData(endpoint, options);
}
export { postRequest };

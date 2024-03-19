'use strict';
import { fetchData } from './fetch';
/**
 * Sends a PUT request to the specified API endpoint with the provided token for authorization.
 * @param {string} endpoint - The API endpoint URL.
 * @param {Object} bodyContent - The body content of the PUT request in JSON format.
 * @returns {Promise<any>} A promise representing the result of the PUT request.
 */
async function putRequest(endpoint, bodyContent) {
    // Retrieve the token from localStorage
    let token = localStorage.getItem('token');
    // Define PUT request options
    const options = {
        method: 'PUT',
        headers: {
            Authorization: 'Bearer: ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyContent), // Convert bodyContent to JSON string
    };
    // Send PUT request using fetchData function and return the promise
    return fetchData(endpoint, options);
}
export { putRequest };

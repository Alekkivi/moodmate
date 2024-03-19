'use strict';
import { fetchData } from './fetch';
/**
 * Sends a DELETE request to the specified API endpoint with the provided token for authorization.
 * @param {string} endpoint - The API endpoint URL.
 * @param {Object} deleteBody - The body of the DELETE request in JSON format.
 * @returns {Promise<any>} A promise representing the result of the DELETE request.
 */

async function deleteRequest(endpoint, deleteBody){
    // Retrieve the token from localStorage
    let token = localStorage.getItem('token');
    // Define request options
    const options = {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer: ' + token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteBody), // Convert deleteBody to JSON string
    };
    // Send DELETE request using fetchData function and return the promise
    return fetchData(endpoint, options);
}

export { deleteRequest };

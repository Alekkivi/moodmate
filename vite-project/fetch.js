'use strict';
/**
 * Fetches JSON data from APIs
 * @param {string} url - api endpoint url
 * @param {Object} options - request options
 * @returns {Object} response json data
 */

const fetchData = async (endpoint, options = {}) => {
    let jsonData;
    try {
        const url = 'https://hyte-server-aleksi.northeurope.cloudapp.azure.com' + endpoint
        console.log('fetchData', options )
        const response = await fetch(url, options);
        // Check for error in response
        if (!response.ok) {
            const errorData = await response.json();
            console.log('fetchData error:', errorData)
            jsonData = {error: errorData.error.message, status: errorData.error.status};
            return jsonData
        }
        jsonData = await response.json();
    } catch (error) {
      //   console.error('fetchData()', error);
        jsonData = {error: error.message};
    }
    return jsonData;
  };
  
/**
 * Sends a GET request to the specified API endpoint with the provided token for authorization.
 * @param {string} endpoint - The API endpoint URL.
 * @returns {Promise<Object>} A promise that resolves to the response JSON data.
 */
async function get(endpoint) {
  const token = localStorage.getItem('token');
  // Define request options
  const options = {
      method: 'GET',
      headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
      },
  };
  // Fetch data using fetchData function and return the promise
  return fetchData(endpoint, options).then((data) => {
      return data;
  });
}


export { fetchData, get};
  
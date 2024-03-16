/**
 * Fetches JSON data from APIs
 *
 * @param {string} url - api endpoint url
 * @param {Object} options - request options
 *
 * @returns {Object} response json data
 */

const fetchData = async (endpoint, options = {}) => {
    let jsonData;
    try {
        const url = "https://hyte-server-aleksi.northeurope.cloudapp.azure.com" + endpoint
        console.log('fetchData', options )
        const response = await fetch(url, options);
  
        if (!response.ok) {
            const errorData = await response.json();
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
  

async function get(endpoint) {
    const token = localStorage.getItem("token");
    // Define request
    const options = {
      method: "GET",
      headers: {
        Authorization: "Bearer: " + token,
        "Content-Type": "application/json",
      },
    };
    // Fetch data and return the promise
    return fetchData(endpoint, options).then((data) => {
      return data;
    });
}

// Send a DELETE request to a specified URL
async function deleteRequest(url, token) {
  // Define the DELETE request
  const options = {
    method: "DELETE",
    headers: {
      Authorization: "Bearer: " + token,
      "Content-Type": "application/json",
    },
  };
  // Send the request
  fetchData(url, options);
}


export { fetchData, get, deleteRequest};
  
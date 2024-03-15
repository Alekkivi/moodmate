/**
 * Fetches JSON data from APIs
 *
 * @param {string} url - api endpoint url
 * @param {Object} options - request options
 *
 * @returns {Object} response json data
 */
const fetchData = async (url, options = {}) => {
    let jsonData;
    try {
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
  

async function get(url) {
    const token = localStorage.getItem("token");
  
    // Define request
    const options = {
      method: "GET",
      headers: {
        Authorization: "Bearer: " + token,
      },
    };
    // Fetch data and return the promise
    return fetchData(url, options).then((data) => {
      return data;
    });
  }
  
  export { fetchData, get };
  
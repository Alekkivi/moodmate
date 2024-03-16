import { fetchData } from "./fetch";

async function postRequest(endpoint, postBody) {
    // Define request
    let token = localStorage.getItem("token");
    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer: " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postBody),
    };
    return fetchData(endpoint, options)
}

export { postRequest}

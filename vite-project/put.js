import { fetchData } from "./fetch";

async function putRequest(endpoint, bodyContent) {
  let token = localStorage.getItem("token");
  // Define PUT request
  const options = {
    method: "PUT",
    headers: {
      Authorization: "Bearer: " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyContent),
  };
  return fetchData(endpoint, options)
}
export {putRequest}
  
import { fetchData } from "./fetch";

async function deleteRequest(endpoint, deleteBody){
    let token = localStorage.getItem("token");
    const options = {
      method: "DELETE",
      headers: {
        Authorization: "Bearer: " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deleteBody),
    };
    return fetchData(endpoint, options)
}
export { deleteRequest }
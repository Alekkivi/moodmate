import { showSnackbar } from "./snackbar";
import { deleteRequest } from "./delete.js";

// Delete chosen entry and card
async function deleteEntry(evt, entryId) {
  // Get date of the correct card on which the button was pressed
  const entryIdToDelete = evt.target.attributes["data-id"].value;
  const entryCard = document.getElementById(entryId);
  const body = {entry_id: entryIdToDelete,};
  const answer = confirm(`Oletko varma poistosta`);
  if (answer) {
    const data = await deleteRequest('/api/entries', body)
    if (!data.error){
      entryCard.innerHTML = "";
      console.log(data);
      showSnackbar("darkgreen", "Entry deleted!");
    } else {
      showSnackbar("crimson", "Couldn't delete entry!");
    }
  }
}
  
export {deleteEntry}
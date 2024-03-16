// --------------- Date functions -------------------
// Format date "yyyy-mm-ddT22:00:00.000Z" ---> "yyyy-mm-dd"
function convertDate(dateString) {
    // Parse the input date string
    const date = new Date(dateString);
    // Add one day
    date.setDate(date.getDate());
    // Get the year, month, and day components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    // Format the date to yyyy-mm-dd
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}
  
  // Reformat dates from yyyy-mm-dd to dd.mm.yyyy
  function formatDate(dateString) {
    // Parse the input date string
    const date = new Date(dateString);
    // Adjust the date to GMT+2 time zone
    const gmtPlus2Date = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    // Extract day, month, and year
    const day = gmtPlus2Date.getDate();
    const month = gmtPlus2Date.getMonth() + 1; // Month is zero-based, so add 1
    const year = gmtPlus2Date.getFullYear();
    // Format the date as "dd-mm-yyyy"
    const formattedDate = `${day < 10 ? "0" : ""}${day}.${
      month < 10 ? "0" : ""
    }${month}.${year}`;
    return formattedDate;
}
  
  // Get current date in "yyyy-mm-dd" -format
  function getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because January is 0-indexed
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Format date from dd.mm.yyyy to yyyy-mm-dd
function convertDate2(dateString) {
  const [day, month, year] = dateString.split('.');
  const convertedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return convertedDate;
}


export {convertDate, formatDate, getCurrentDate, convertDate2}
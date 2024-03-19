'use strict';
/**
 * Converts a date string from "yyyy-mm-ddT22:00:00.000Z" format to "yyyy-mm-dd".
 * @param {string} dateString - The input date string.
 * @returns {string} The formatted date string.
 */
function convertDate(dateString) {
  // Parse the input date string
  const date = new Date(dateString);
  // Get the year, month, and day components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // Format the date to yyyy-mm-dd
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}
/**
* Format a date string from "yyyy-mm-dd" to "dd.mm.yyyy".
* @param {string} dateString - The input date string.
* @returns {string} The reformatted date string.
*/
function formatDate(dateString) {
  // Parse the input date string
  const date = new Date(dateString);
  // Adjust the date to GMT+2 time zone
  const gmtPlus2Date = new Date(date.getTime() + 2 * 60 * 60 * 1000);
  // Extract day, month, and year
  const day = gmtPlus2Date.getDate();
  const month = gmtPlus2Date.getMonth() + 1; // Month is zero-based, so add 1
  const year = gmtPlus2Date.getFullYear();
  // Format the date as "dd.mm.yyyy"
  const formattedDate = `${day < 10 ? "0" : ""}${day}.${month < 10 ? "0" : ""}${month}.${year}`;
  return formattedDate;
}
/**
* Get the current date in "yyyy-mm-dd" format.
* @returns {string} The current date string.
*/
function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because January is 0-indexed
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export { convertDate, formatDate, getCurrentDate };

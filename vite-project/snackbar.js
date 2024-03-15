// Show snackbar
function showSnackbar(color, text) {
    const x = document.getElementById("snackbar-target");
    x.className = "show";
    x.innerText = text
    x.style.backgroundColor = color
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    if (!x.classList.contains("show")) {
      x.classList.add("show");
      setTimeout(function () {
        x.classList.remove("show");
      }, 3000);
    }
}

export {showSnackbar}
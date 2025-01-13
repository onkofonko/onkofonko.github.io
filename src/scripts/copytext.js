document.getElementById("copyDiscord").addEventListener("click", function(event) {
  event.preventDefault();
  var username = this.getAttribute("discord-username");
  navigator.clipboard.writeText(username).then(function() {
    console.log("Copied to clipboard: " + username);
  }).catch(function(error) {
    console.error("Error copying username to clipboard:", error);
  });
});
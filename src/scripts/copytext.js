document.getElementById("clickableDiv").addEventListener("click", function () {
  var copyTextElement = document.getElementById("discord-username");

  var originalText = copyTextElement.innerText;

  var textToCopy = originalText;

  navigator.clipboard
    .writeText(textToCopy)
    .then(function () {
      copyTextElement.innerText = "Copied!";

      setTimeout(function () {
        copyTextElement.innerText = originalText;
      }, 1000);
    })
    .catch(function (error) {
      console.error("Error copying username to clipboard:", error);
    });
});

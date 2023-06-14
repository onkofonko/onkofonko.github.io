document.getElementById("clickableDiv").addEventListener("click", function () {
  var copyTextElement = document.getElementById("discord-username");
  var originalText = copyTextElement.innerText;
  var textToCopy = originalText;
  var buttonWidth = copyTextElement.offsetWidth;

  navigator.clipboard
    .writeText(textToCopy)
    .then(function () {
      copyTextElement.innerText = "Copied!";
      copyTextElement.style.width = buttonWidth + "px";

      setTimeout(function () {
        copyTextElement.innerText = originalText;
        copyTextElement.style.width = "";
      }, 1000);
    })
    .catch(function (error) {
      console.error("Error copying username to clipboard:", error);
    });
});

// Get access to the messages container
const messagesContainer = document.getElementById("messages");

/* Handle text in textarea after msg-button is pressed */
const sendButton = document.getElementById("send-msg-btn");
sendButton.addEventListener("click", (event) => {
    // Check if there is text in textarea and do nothing if it is empty
    let textArea = document.getElementById("input-msg");
    let text = textArea.value;

    // If textArea was empty when button was pressed, do nothing
    if (text.length != 0) {

        let textWithNewLine = text.replaceAll("\n", "<br/>");  // Allows the display of new line characters in the messages
        messagesContainer.insertAdjacentHTML("beforeend", `<div class="message"> ${textWithNewLine} </div>`);
        let newMessage = messagesContainer.lastChild;

        // Make the new message scroll into view if the messagesContainer was full before its addition
        newMessage.scrollIntoView({"behavior": "smooth"});

        // Make textArea empty again
        textArea.value = "";

    }
});

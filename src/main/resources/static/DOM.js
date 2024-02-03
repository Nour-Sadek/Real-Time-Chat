// Get access to the messages container
const messagesContainer = document.getElementById("messages");

// A websocket connection is established immediately when a user opens a chat page
var socket = new SockJS("/ws");
var stompClient = Stomp.over(socket);
stompClient.connect({}, () => stompClient.subscribe("/topic/public", onMessageReceived));  // Connect to the public topic

function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);
    let text = message.content;

    let textWithNewLine = text.replaceAll("\n", "<br/>");  // Allows the display of new line characters in the messages
    messagesContainer.insertAdjacentHTML("beforeend", `<div class="message"> ${textWithNewLine} </div>`);
    let newMessage = messagesContainer.lastChild;

    // Make the new message scroll into view if the messagesContainer was full before its addition
    newMessage.scrollIntoView({"behavior": "smooth"});
}


/* Handle text in textarea after msg-button is pressed */
const sendButton = document.getElementById("send-msg-btn");
sendButton.addEventListener("click", (event) => {
    // Check if there is text in textarea and do nothing if it is empty
    let textArea = document.getElementById("input-msg");
    let text = textArea.value.trim();

    // If textArea was empty when button was pressed, do nothing
    if (text.length != 0 && stompClient) {

        let chatMessage = {
            content: text
        };

        // Alert other subscribers
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));

        // Make textArea empty again
        textArea.value = "";

    }
});

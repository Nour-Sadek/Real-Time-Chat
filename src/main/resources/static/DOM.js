// Get access to certain html elements
const messagesContainer = document.getElementById("messages");
const loginPage = document.getElementById("login-page");
const chatPage = document.getElementById("main-body");
const alertMessage = document.getElementById("existent-username-alert");
const users = document.getElementById("users");

const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "Sept", "Oct", "Nov", "Dec"];

var stompClient = null;
var username = null;
var subscribeObject = null;
var subscribeObjectLogin = null;

function addMessageToChat(message) {

    // Getting the content of the message
    let text = message.content;
    let textWithNewLine = text.replaceAll("\n", "<br/>");  // Allows the display of new line characters in the messages

    // Getting the date to display
    let fullDate = new Date(message.timeCreated);
    let hours = String(fullDate.getHours()).length == 2 ? fullDate.getHours() : "0" + fullDate.getHours();
    let minutes = String(fullDate.getMinutes()).length == 2 ? fullDate.getMinutes() : "0" + fullDate.getMinutes();
    let time = hours + ":" + minutes;
    let day = months[fullDate.getMonth()] + " " + fullDate.getDate();
    let displayedDate = time + " | " + day;

    // Getting the user name
    let user = message.sender;

    // Create the message-container div that contains the other three info (userName, content, and date)
    let myElement = document.createElement("div");
    myElement.classList.add("message-container");

    myElement.insertAdjacentHTML("beforeend", `<div class="sender"> ${user} </div>`);
    myElement.insertAdjacentHTML("beforeend", `<div class="date"> ${displayedDate} </div>`);
    myElement.insertAdjacentHTML("beforeend", `<div class="message"> ${textWithNewLine} </div>`);

    messagesContainer.append(myElement);

    // Make the new message scroll into view if the messagesContainer was full before its addition
    myElement.scrollIntoView({"behavior": "smooth"});

}

function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);
    addMessageToChat(message);
}

function sendMessage(event) {

    // Check if there is text in textarea and do nothing if it is empty
    let textArea = document.getElementById("input-msg");
    let text = textArea.value.trim();

    // If textArea was empty when button was pressed, do nothing
    if (text.length != 0 && stompClient) {

        let chatMessage = {
            content: text,
            timeCreated: new Date()
        };

        // Make textArea empty again
        textArea.value = "";

        // Alert other subscribers
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));

    }

}

function connect(event) {

    let userNameArea = document.getElementById("input-username");
    username = userNameArea.value.trim();

    userNameArea.value = "";

    if (username.length != 0) {

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected);

    }

}

function populateUI(payload) {

    subscribeObject.unsubscribe();

    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    if (payload.length == 0) return;

    let chatMessages = JSON.parse(payload.body);

    for (let i = 0; i < chatMessages.length; i++) {
        let message = chatMessages[i];
        addMessageToChat(message);
    }

}

function removeOnlineUser(payload) {

    let disconnectedUser = payload.body;

    if (disconnectedUser) {
        let allUsersNodeList = document.querySelectorAll(".user");
        allUsersNodeList.forEach(el => {
            if (el.textContent.trim() == disconnectedUser) {
                el.remove();
            }
        });
    }

}

function addOnlineUser(payload) {

    let connectedUsers = JSON.parse(payload.body);
    connectedUsers = connectedUsers.filter(e => e !== username);

    if (connectedUsers.length != 0) {
        users.innerHTML = "";
        for (let i = 0; i < connectedUsers.length; i++) {
            let connectedUser = connectedUsers[i];
            users.insertAdjacentHTML("beforeend", `<div class="user"> ${connectedUser} </div>`);
        }
    }

}

function confirmConnection(payload) {

    // Unsubscribe after knowing whether the user is unique
    subscribeObjectLogin.unsubscribe();

    let isUnique = JSON.parse(payload.body);

    if (isUnique) {

        loginPage.classList.add('hidden');
        chatPage.classList.add('main-chat-room');
        chatPage.classList.remove('hidden');

        let user = {
            userName: username
        };

        // Subscribe to this topic to populate UI with previous messages (for new logins only)
        subscribeObject = stompClient.subscribe('/topic/previous', populateUI)

        // Add the username to the registry
        stompClient.send("/app/chat.addUser", {}, JSON.stringify(user));

        // Subscribe to topics that update displayed online users
        stompClient.subscribe('/topic/removeOnlineUser', removeOnlineUser);
        stompClient.subscribe('/topic/addOnlineUser', addOnlineUser);

    } else {
        alertMessage.classList.remove('hidden');
    }
}

function onConnected() {

    // Check if the username is unique
    subscribeObjectLogin = stompClient.subscribe('/topic/continue', confirmConnection);
    stompClient.send("/app/chat.checkIfUnique", {}, username);

}

/* Handle text in textarea after msg-button is pressed */
const sendButton = document.getElementById("send-msg-btn");
sendButton.addEventListener("click", sendMessage);

/* Handle user login after send-username-btn is pressed */
const loginButton = document.getElementById("send-username-btn");
loginButton.addEventListener("click", connect);

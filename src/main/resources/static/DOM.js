// Get access to certain html elements
const messagesContainer = document.getElementById("messages");
const loginPage = document.getElementById("login-page");
const chatPage = document.getElementById("main-body");
const alertMessage = document.getElementById("existent-username-alert");
const users = document.getElementById("users");
const publicChatButton = document.getElementById("public-chat-btn");
const chatWithLabel = document.getElementById("chat-with");

const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "Sept", "Oct", "Nov", "Dec"];

var stompClient = null;
var username = null;
var otherChatter = null;
var subscribeObject = null;
var subscribeObjectLogin = null;
var publicTopicSubscribeObject = null;
var privateMessagesObject = null;
var privateSubscriptions = [];

function isSubscribedToTopic(topic) {
    return client.subscriptions.some(sub => sub.id === subscription.id && sub.destination === topic);
}

// Add an Event Listener to the publicChatButton
publicChatButton.addEventListener("click", function(e) {
    // Check the current status of the button
    if (this.classList.contains("active-chat")) {
        return;
    }

    /* Make the public messages appear */

    // Subscribe to this topic to populate UI with previous messages
    subscribeObject = stompClient.subscribe('/topic/previous', populateUI);

    // Populate Chat with the public messages
    stompClient.send("/app/chat.getPublicMessages", {});

    // Change the Chat-With label to Public Chat
    chatWithLabel.innerHTML = "Public Chat";

    // Change the color of the public chat button to blue
    publicChatButton.classList.remove("dorment-chat");
    publicChatButton.classList.add("active-chat");

    // Change the color of all online users to grey
    let allUsersNodeList = document.querySelectorAll(".user-container");
    allUsersNodeList.forEach(el => {
        if (el.classList.contains("active-chat")) {
            el.classList.remove("active-chat");
            el.classList.add("dorment-chat");
        }
    });

    otherChatter = null;

});

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

function sendPrivateMessage(payload) {
    let message = JSON.parse(payload.body);
    let array = [message.sender, message.receiver];
    if (array.includes(username) && array.includes(otherChatter)) {
        // Move the user who sent the message at the top of the receiver's list and the receiver at the top of the sender's list
        let displayedUsers = users.getElementsByClassName("user-container");
        let userContainerElement = null;
        for (let i = 0; i < displayedUsers.length; i++) {
            let userContainer = displayedUsers[i];
            if (array.includes(userContainer.querySelector(".user").textContent.trim())) {
                users.removeChild(userContainer);
                users.insertBefore(userContainer, users.firstChild);
                break;
            }
        }
        // Add the message
        addMessageToChat(message);
    } else {  // The receiver is not on the private chat, so new-message-counter needs to be updated
        // Find the message.sender whose new-message-counter needs to be updated
        let displayedUsers = users.getElementsByClassName("user-container");
        let userContainerElement = null;
        for (let i = 0; i < displayedUsers.length; i++) {
            let userContainer = displayedUsers[i];
            if (userContainer.querySelector(".user").textContent.trim() === message.sender) {
                messageCounterElement = userContainer.querySelector(".new-message-counter");
                userContainerElement = userContainer;
                if (messageCounterElement.classList.contains("hidden")) {
                    messageCounterElement.textContent = 1;
                    messageCounterElement.classList.remove("hidden");
                } else {
                    messageCounterElement.textContent = parseInt(messageCounterElement.textContent) + 1;
                }
                break;
            }
        }
        // Insert the user with the new message as the first
        if (userContainerElement !== null) {
            users.removeChild(userContainerElement);
            users.insertBefore(userContainerElement, users.firstChild);
        }

    }
}

function sendMessage(event) {

    // Check if there is text in textarea and do nothing if it is empty
    let textArea = document.getElementById("input-msg");
    let text = textArea.value.trim();

    // If textArea was empty when button was pressed, do nothing
    if (text.length != 0 && stompClient) {

        // Make textArea empty again
        textArea.value = "";

        let chatMessage = {
            content: text,
            timeCreated: new Date(),
            receiver: otherChatter
        };

        if (otherChatter === null) { // We are in the Public Chat Room
            // Alert other subscribers
            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        } else { // We are in a private chat room
            // Alert otherChatter
            stompClient.send("/app/chat.sendPrivateMessage", {}, JSON.stringify(chatMessage));
        }

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
    publicTopicSubscribeObject = stompClient.subscribe('/topic/public', onMessageReceived);

    if (payload.length == 0) return;

    let chatMessages = JSON.parse(payload.body);
    messagesContainer.innerHTML = "";

    for (let i = 0; i < chatMessages.length; i++) {
        let message = chatMessages[i];
        if (message.receiver === null) { // Make sure only public messages are displayed
            addMessageToChat(message);
        }
    }

}

function removeOnlineUser(payload) {

    let disconnectedUser = payload.body;

    if (disconnectedUser) {
        let allUsersNodeList = document.querySelectorAll(".user-container");
        allUsersNodeList.forEach(el => {
            if (el.querySelector(".user").textContent.trim() == disconnectedUser) {
                el.remove();
            }
        });
    }

}

function populateWithPrivateMessages(payload) {

    privateMessagesObject.unsubscribe();

    let chatMessages = JSON.parse(payload.body);
    messagesContainer.innerHTML = "";

    for (let i = 0; i < chatMessages.length; i++) {
        let message = chatMessages[i];
        addMessageToChat(message);
    }

}

function addOnlineUser(payload) {

    let connectedUsers = JSON.parse(payload.body);
    connectedUsers = connectedUsers.filter(e => e !== username);

    if (connectedUsers.length != 0) {
        // Get all users already present on the page
        let currentlyDisplayedUsers = [];
        let displayedUsers = users.getElementsByClassName("user-container");
        for (let i = 0; i < displayedUsers.length; i++) {
            let userContainer = displayedUsers[i];
            currentlyDisplayedUsers.push(userContainer.querySelector(".user").textContent.trim());
        }
        // Go over all connected users and display those that aren't currently displayed
        for (let i = 0; i < connectedUsers.length; i++) {
            let connectedUser = connectedUsers[i];
            if (currentlyDisplayedUsers.includes(connectedUser)) {
                continue;
            }
            users.insertAdjacentHTML("beforeend", `<div class="user-container dorment-chat"> <div class="user">${connectedUser}</div> <div class="new-message-counter hidden"> 0 </div> </div>`);
            let newlyAddedUser = users.lastChild;
            // Create a topic whose subscribers are only the current user and the connectedUser
            let destination = "/topic/" + username + "_" + connectedUser;
            if (!privateSubscriptions.includes(destination)) {
                stompClient.subscribe(destination, sendPrivateMessage);
                privateSubscriptions.push(destination);
            }
            newlyAddedUser.addEventListener("click", function (e) {
                // Make the public messages container empty
                messagesContainer.innerHTML = "";
                // Make the color of all other online users grey
                let allUsersNodeList = document.querySelectorAll(".user-container");
                allUsersNodeList.forEach(el => {
                    if (el.classList.contains("active-chat")) {
                        el.classList.remove("active-chat");
                        el.classList.add("dorment-chat");
                    }
                });
                // Make the color of the Public Chat Button grey
                if (publicChatButton.classList.contains("active-chat")) {
                    publicChatButton.classList.remove("active-chat");
                    publicChatButton.classList.add("dorment-chat");
                }
                // Make the color of the chosen user blue
                if (this.classList.contains("dorment-chat")) {
                    this.classList.remove("dorment-chat");
                    this.classList.add("active-chat");
                }
                // Change the Chat-With label to the clicked user's username
                chatWithLabel.innerHTML = this.querySelector(".user").textContent.trim();
                // Unsubscribe from the public topic
                publicTopicSubscribeObject.unsubscribe();

                otherChatter = this.querySelector(".user").textContent.trim();

                // Hide the new-message-counter div and change its value to zero
                if (!this.querySelector(".new-message-counter").classList.contains("hidden")) {
                    this.querySelector(".new-message-counter").classList.add("hidden");
                    this.querySelector(".new-message-counter").textContent = 0;
                }

                // Populate messages page with previously sent private messages between the two users
                privateMessagesObject = stompClient.subscribe("/topic/privateMessages", populateWithPrivateMessages);
                stompClient.send("/app/chat.getPrivateMessages", {}, JSON.stringify({sender: username, receiver: otherChatter}));

            });
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
            userName: username,
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

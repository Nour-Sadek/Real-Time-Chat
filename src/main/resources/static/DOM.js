// Get access to certain html elements
const messagesContainer = document.getElementById("messages");
const loginPage = document.getElementById("login-page");
const chatPage = document.getElementById("main-body");

const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "Sept", "Oct", "Nov", "Dec"];

var stompClient = null;
var username = null;
var subscribeObject = null;

function onMessageReceived(payload) {

    let message = JSON.parse(payload.body);

    // Getting the content of the message
    let text = message.content;
    let textWithNewLine = text.replaceAll("\n", "<br/>");  // Allows the display of new line characters in the messages

    // Getting the date to display
    let fullDate = new Date(message.timeCreated);
    let time = fullDate.getHours() + ":" + fullDate.getMinutes();
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
        loginPage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        populateUI();

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected);
    }

}

function populateUI(payload) {

    if (payload === undefined) return;

    let chatMessages = JSON.parse(payload.body);
    let count = messagesContainer.childElementCount;

    for (let i = count; i < chatMessages.length; i++) {
        let message = chatMessages[i];

        // Getting the content of the message
            let text = message.content;
            let textWithNewLine = text.replaceAll("\n", "<br/>");  // Allows the display of new line characters in the messages

            // Getting the date to display
            let fullDate = new Date(message.timeCreated);
            let time = fullDate.getHours() + ":" + fullDate.getMinutes();
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

    stompClient.unsubscribe(subscribeObject);

}

function onConnected() {

    let user = {
        userName: username
    };

    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);
    subscribeObject = stompClient.subscribe('/topic/previous', populateUI)

    // Add the username to the registry
    stompClient.send("/app/chat.addUser", {}, JSON.stringify(user));

}

/* Handle text in textarea after msg-button is pressed */
const sendButton = document.getElementById("send-msg-btn");
sendButton.addEventListener("click", sendMessage);

/* Handle user login after send-username-btn is pressed */
const loginButton = document.getElementById("send-username-btn");
loginButton.addEventListener("click", connect);

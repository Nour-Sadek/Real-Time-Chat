# Real-Time-Chat

### Learning Outcomes

- How to use HTML/CSS and JavaScript for the app frontend.
- How to use Java, Spring Boot, and WebSocket with STOMP protocol as the solution for the backend.

### About

This is a simple multi-user chat application; it supports public chats where all users of the app can send and 
see messages, and private chat between two app users.

If you want a visual representation of how the app should look like, please look at the Examples section of the following 
web-page: [Project's Final Stage](https://hyperskill.org/projects/313/stages/1763/implement).

This application runs in real-time; after the project is stopped, all information is lost. Every new user has to sign in with a unique username, 
and then they will be directed to the main Chat Page. Every new user will start with the Public Chat open with all previous messages that were 
sent visible. Other online users will be present as a list on the left side of the page. The user can send public messages, 
which will be visible to all users, or private messages to any of the available online users. Whenever a private message is sent, 
and the receiver wasn't on that sender's private chat window, a new message counter will appear displaying the number of unread 
messages, and the name of the most recent sender will be moved to the top of the online users' list.

Once a user logs out (by simply closing off the window), their username becomes available for reuse and the public messages they 
have sent already will stay, but there won't be access to their private messages anymore.

# General Info

To learn more about this project, please visit [HyperSkill Website - Real-Time Chat](https://hyperskill.org/projects/313).

This project's difficulty has been labelled as __Challenging__ where this is how
HyperSkill describes each of its four available difficulty levels:

- __Easy Projects__ - if you're just starting
- __Medium Projects__ - to build upon the basics
- __Hard Projects__ - to practice all the basic concepts and learn new ones
- __Challenging Projects__ - to perfect your knowledge with challenging tasks

Project was built using java 17

# How to Run

Download the root project as a zip folder, extract the folder and open it in IntelliJ IDEA (or another IDE of choice) 
and run the src/main/java/chat/Application.java file

The website can be accessed using localhost:8080 on your browser of choice. To simulate multiple users, open multiple 
browser windows using localhost:8080.

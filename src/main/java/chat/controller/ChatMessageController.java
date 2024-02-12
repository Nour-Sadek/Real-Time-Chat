package chat.controller;

import chat.model.ChatMessage;
import chat.model.User;
import chat.registry.ChatMessagesRegistry;
import chat.registry.UserSessionRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
public class ChatMessageController {

    private final UserSessionRegistry userSessionRegistry;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessagesRegistry chatMessagesRegistry;

    @Autowired
    public ChatMessageController(UserSessionRegistry userSessionRegistry, SimpMessagingTemplate messagingTemplate, ChatMessagesRegistry chatMessagesRegistry) {
        this.userSessionRegistry = userSessionRegistry;
        this.messagingTemplate = messagingTemplate;
        this.chatMessagesRegistry = chatMessagesRegistry;
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage,
                                   @Header("simpSessionId") String sessionId) {

        chatMessagesRegistry.registerChatMessage(chatMessage);
        User sender = userSessionRegistry.getUserForSession(sessionId);
        chatMessage.setSender(sender.getUserName());

        return chatMessage;
    }

    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage,
                                   @Header("simpSessionId") String sessionId) {

        chatMessagesRegistry.registerChatMessage(chatMessage);
        User sender = userSessionRegistry.getUserForSession(sessionId);
        chatMessage.setSender(sender.getUserName());

        // Send a message to "/topic/{sender}_{receiver}" to add new private message
        String destination1 = "/topic/" + sender.getUserName() + "_" + chatMessage.getReceiver();
        messagingTemplate.convertAndSend(destination1, chatMessage);
        String destination2 = "/topic/" + chatMessage.getReceiver() + "_" + sender.getUserName();
        messagingTemplate.convertAndSend(destination2, chatMessage);

    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/previous")
    public List<ChatMessage> addUser(@Payload User user,
                                     @Header("simpSessionId") String sessionId) {
        // Add username in web socket session
        userSessionRegistry.registerUserSession(user, sessionId);

        return chatMessagesRegistry.getChatMessageRegistry();
    }

    @MessageMapping("/chat.getPublicMessages")
    @SendTo("/topic/previous")
    public List<ChatMessage> getPublicMessages() {
        return chatMessagesRegistry.getChatMessageRegistry();
    }

    @MessageMapping("/chat.checkIfUnique")
    @SendTo("/topic/continue")
    public boolean isUserUnique(@Payload String userName) {
        return !userSessionRegistry.hasUser(userName);
    }

    @MessageMapping("/chat.getPrivateMessages")
    @SendTo("/topic/privateMessages")
    public List<ChatMessage> getPrivateMessages(@Payload ChatMessage bothChatters) {
        List<ChatMessage> privateMessages = new ArrayList<>();
        List<String> twoUsers = new ArrayList<>();
        twoUsers.add(bothChatters.getSender());
        twoUsers.add(bothChatters.getReceiver());
        for (ChatMessage message: chatMessagesRegistry.getChatMessageRegistry()) {
            String sender = message.getSender();
            String receiver = message.getReceiver();
            if (twoUsers.contains(sender) && twoUsers.contains(receiver)) {
                privateMessages.add(message);
            }
        }
        return privateMessages;
    }

}

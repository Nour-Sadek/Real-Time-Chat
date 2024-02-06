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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChatMessageController {

    private final UserSessionRegistry userSessionRegistry;
    private final ChatMessagesRegistry chatMessagesRegistry;

    @Autowired
    public ChatMessageController(UserSessionRegistry userSessionRegistry, ChatMessagesRegistry chatMessagesRegistry) {
        this.userSessionRegistry = userSessionRegistry;
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
}

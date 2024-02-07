package chat.config;

import chat.model.ChatMessage;
import chat.registry.ChatMessagesRegistry;
import chat.registry.UserSessionRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.List;

@Component
public class WebSocketEventListener {

    private final UserSessionRegistry userSessionRegistry;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessagesRegistry chatMessagesRegistry;

    @Autowired
    WebSocketEventListener(UserSessionRegistry userSessionRegistry, SimpMessagingTemplate messagingTemplate, ChatMessagesRegistry chatMessagesRegistry) {
        this.userSessionRegistry = userSessionRegistry;
        this.messagingTemplate = messagingTemplate;
        this.chatMessagesRegistry = chatMessagesRegistry;
    }

    @EventListener
    public void disconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Remove the disconnected session from the registry
        String disconnectedSessionId = headerAccessor.getSessionId();
        String userName = userSessionRegistry.removeSession(disconnectedSessionId);

        // Remove all chat messages where they are either the receiver, or they are the sender and the receiver's not null
        List<ChatMessage> allChats = chatMessagesRegistry.getChatMessageRegistry();
        allChats.removeIf(message -> userName.equals(message.getReceiver()) || (userName.equals(message.getSender()) && message.getReceiver() != null));

        // Send a message to "/topic/removeOnlineUser" to remove userName from list of online users in UI
        messagingTemplate.convertAndSend("/topic/removeOnlineUser", userName);

    }

    @EventListener
    public void connectToPublic(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Check whether the connection was for the /public/topic
        String sessionId = headerAccessor.getSessionId();
        String destination = headerAccessor.getDestination();

        if (destination.equals("/topic/public")) {
            String userName = userSessionRegistry.getUserForSession(sessionId).getUserName();

            // Send a message to "/topic/addOnlineUser" to add all users except current one to list of online users in UI
            messagingTemplate.convertAndSend("/topic/addOnlineUser", userSessionRegistry.getAllUserNames());
        }

    }

}

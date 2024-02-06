package chat.config;

import chat.registry.UserSessionRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Component
public class WebSocketEventListener {

    private final UserSessionRegistry userSessionRegistry;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    WebSocketEventListener(UserSessionRegistry userSessionRegistry, SimpMessagingTemplate messagingTemplate) {
        this.userSessionRegistry = userSessionRegistry;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void disconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Remove the disconnected session from the registry
        String disconnectedSessionId = headerAccessor.getSessionId();
        String userName = userSessionRegistry.removeSession(disconnectedSessionId);

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

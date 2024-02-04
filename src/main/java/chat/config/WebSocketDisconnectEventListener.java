package chat.config;

import chat.registry.UserSessionRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketDisconnectEventListener implements ApplicationListener<SessionDisconnectEvent> {

    private final UserSessionRegistry userSessionRegistry;

    @Autowired
    WebSocketDisconnectEventListener(UserSessionRegistry userSessionRegistry) {
        this.userSessionRegistry = userSessionRegistry;
    }
    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Remove the disconnected session from the registry
        String disconnectedSessionId = headerAccessor.getSessionId();
        userSessionRegistry.removeSession(disconnectedSessionId);

    }

}

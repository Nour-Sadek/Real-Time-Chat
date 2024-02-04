package chat.registry;

import chat.model.User;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserSessionRegistry {

    private final Map<String, User> userSessionMap = new ConcurrentHashMap<>();

    public void registerUserSession(User user, String sessionId) {
        userSessionMap.put(sessionId, user);
    }

    public User getUserForSession(String sessionId) {
        return userSessionMap.get(sessionId);
    }

    public void removeSession(WebSocketSession session) {
        userSessionMap.remove(session.getId());
    }
    public void removeSession(String session) {
        userSessionMap.remove(session);
    }
    public boolean hasUser(String userName) {
        for (User user: userSessionMap.values()) {
            if (user.getUserName().equals(userName)) {
                return true;
            }
        }
        return false;
    }

}

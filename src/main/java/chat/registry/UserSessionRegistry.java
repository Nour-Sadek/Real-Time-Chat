package chat.registry;

import chat.model.User;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.ConcurrentHashMap;
import java.util.*;

@Component
public class UserSessionRegistry {

    private final Map<String, User> userSessionMap = new ConcurrentHashMap<>();
    private final List<String> allUsers = new ArrayList<>();

    public void registerUserSession(User user, String sessionId) {

        userSessionMap.put(sessionId, user);
        allUsers.add(user.getUserName());

    }

    public User getUserForSession(String sessionId) {
        return userSessionMap.get(sessionId);
    }

    public String removeSession(WebSocketSession session) {

        String disconnectedUser = getUserForSession(session.getId()).getUserName();
        allUsers.remove(disconnectedUser);
        userSessionMap.remove(session.getId());

        return disconnectedUser;
    }
    public String removeSession(String session) {

        String disconnectedUser = getUserForSession(session).getUserName();
        allUsers.remove(disconnectedUser);
        userSessionMap.remove(session);

        return disconnectedUser;
    }
    public boolean hasUser(String userName) {
        return allUsers.contains(userName);
    }

    public String toString() {
        String output = "Session Id : UserName\n";
        for (var entrySet: userSessionMap.entrySet()) {
            output += entrySet.getKey() + " : " + entrySet.getValue().getUserName() + "\n";
        }
        return output;
    }

    public boolean isEmpty() {
        return userSessionMap.isEmpty();
    }

    public List<String> getAllUsers() {
        return allUsers;
    }

}

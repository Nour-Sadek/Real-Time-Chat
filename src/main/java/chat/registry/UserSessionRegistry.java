package chat.registry;

import chat.model.User;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.ConcurrentHashMap;
import java.util.*;

@Component
public class UserSessionRegistry {

    private final Map<String, User> userSessionMap = new ConcurrentHashMap<>();
    private final List<User> allUsers = new ArrayList<>();

    public void registerUserSession(User user, String sessionId) {

        userSessionMap.put(sessionId, user);
        allUsers.add(user);

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
        allUsers.remove(getUserForSession(session));
        userSessionMap.remove(session);

        return disconnectedUser;
    }
    public boolean hasUser(String userName) {

        for (User user: allUsers) {
            if (user.getUserName().equals(userName)) return true;
        }

        return false;
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

    public List<User> getAllUsers() {
        return allUsers;
    }
    public List<String> getAllUserNames() {
        List<String> allUserNames = new ArrayList<>();
        for (User user: allUsers) {
            allUserNames.add(user.getUserName());
        }
        return allUserNames;
    }

}

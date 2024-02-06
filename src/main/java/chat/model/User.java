package chat.model;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;


public class User {

    private String userName;
    private Map<String, List<ChatMessage>> chatMessages = new ConcurrentHashMap<>();

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Map<String, List<ChatMessage>> getChatMessages() {
        return chatMessages;
    }

    public void setChatMessages(Map<String, List<ChatMessage>> chatMessages) {
        this.chatMessages = chatMessages;
    }
}

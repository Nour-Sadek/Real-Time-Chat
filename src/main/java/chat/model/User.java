package chat.model;

import java.util.*;


public class User {

    private String userName;
    private List<ChatMessage> chatMessages = Collections.synchronizedList(new ArrayList<>());

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public List<ChatMessage> getChatMessages() {
        return chatMessages;
    }

    public void setChatMessages(List<ChatMessage> chatMessages) {
        this.chatMessages = chatMessages;
    }
}

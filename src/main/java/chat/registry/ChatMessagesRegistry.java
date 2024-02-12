package chat.registry;

import chat.model.ChatMessage;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ChatMessagesRegistry {

    private final List<ChatMessage> chatMessages = Collections.synchronizedList(new ArrayList<>());

    public void registerChatMessage(ChatMessage chatMessage) {
        chatMessages.add(chatMessage);
    }

    public List<ChatMessage> getChatMessageRegistry() {
        return this.chatMessages;
    }

}

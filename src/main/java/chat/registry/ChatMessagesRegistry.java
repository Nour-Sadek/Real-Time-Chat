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

    public List<ChatMessage> getMessagesBetweenTwoUsers(String sender, String receiver) {
        List<ChatMessage> output = new ArrayList<>();
        for (ChatMessage message: chatMessages) {
            if (message.getSender().equals(sender) && Objects.equals(message.getReceiver(), receiver)) output.add(message);
        }
        return output;
    }

}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, MoreHorizontal } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ConversationWithDetails, MessageWithSender } from "@/lib/types";

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConversationId?: number;
}

export default function MessagingModal({ isOpen, onClose, initialConversationId }: MessagingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    initialConversationId || null
  );
  const [newMessage, setNewMessage] = useState("");

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
    enabled: isOpen && !!user,
    retry: false,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: [`/api/conversations/${selectedConversationId}/messages`],
    enabled: isOpen && !!selectedConversationId,
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversationId) throw new Error("No conversation selected");
      return apiRequest("POST", `/api/conversations/${selectedConversationId}/messages`, {
        content,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      // Invalidate messages and conversations to update last message
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${selectedConversationId}/messages`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getConversationName = (conversation: ConversationWithDetails) => {
    const { firstName, lastName } = conversation.otherUser;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "Anonymous User";
  };

  const getInitials = (conversation: ConversationWithDetails) => {
    const name = getConversationName(conversation);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Auto-select first conversation if none selected
  if (conversations.length > 0 && !selectedConversationId && !conversationsLoading) {
    setSelectedConversationId(conversations[0].id);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
              <DialogTitle>Messages</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1">
              {conversationsLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      selectedConversationId === conversation.id
                        ? "bg-primary/10 dark:bg-primary/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.otherUser.profileImageUrl || undefined} />
                        <AvatarFallback>{getInitials(conversation)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getConversationName(conversation)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          About: {conversation.listing.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(conversation.lastMessageAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Start messaging sellers to see conversations here
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.otherUser.profileImageUrl || undefined} />
                      <AvatarFallback>{getInitials(selectedConversation)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getConversationName(selectedConversation)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        About: {selectedConversation.listing.title}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Make Offer
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Listing
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start space-x-3 animate-pulse">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.senderId === user?.id;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-3 ${
                              isOwnMessage ? "justify-end" : ""
                            }`}
                          >
                            {!isOwnMessage && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {message.sender.firstName?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-first" : ""}`}>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isOwnMessage
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                                isOwnMessage ? "text-right" : ""
                              }`}>
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            
                            {isOwnMessage && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {user?.firstName?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

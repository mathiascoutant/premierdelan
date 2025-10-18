"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "../config/api";

interface Conversation {
  id: string;
  participant: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  status: "pending" | "accepted" | "rejected";
  unreadCount: number;
}

interface Message {
  id?: string;
  _id?: string;
  content: string;
  senderId?: string;
  sender_id?: string;
  timestamp?: string;
  created_at?: string;
  delivered_at?: string;
  read_at?: string;
  isRead?: boolean;
  is_read?: boolean;
}

function ChatPageContent() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"chats" | "invitations">("chats");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    const checkPendingConversation = async () => {
      const hash = window.location.hash;
      if (hash.startsWith("#conversation=")) {
        const conversationId = hash.replace("#conversation=", "");
        setPendingConversationId(conversationId);
        window.history.replaceState({}, "", "/chat");
        return;
      }

      const storedId = localStorage.getItem("pending_conversation_id");
      const timestamp = localStorage.getItem("pending_conversation_timestamp");

      if (storedId) {
        const now = Date.now();
        const age = timestamp ? now - parseInt(timestamp) : 0;

        if (age < 30000) {
          setPendingConversationId(storedId);
          localStorage.removeItem("pending_conversation_id");
          localStorage.removeItem("pending_conversation_timestamp");
          return;
        } else {
          localStorage.removeItem("pending_conversation_id");
          localStorage.removeItem("pending_conversation_timestamp");
        }
      }

      if ("caches" in window) {
        try {
          const cache = await caches.open("notification-data");
          const response = await cache.match("/notification-data");

          if (response) {
            const data = await response.json();
            const age = Date.now() - (data.timestamp || 0);

            if (age < 30000) {
              setPendingConversationId(data.conversationId);
            }
            await cache.delete("/notification-data");
          }
        } catch (e) {
          // Silence
        }
      }
    };

    checkPendingConversation();
  }, []);

  useEffect(() => {
    if (authLoading || isLoading) return;
    if (!isAdmin()) {
      router.push("/");
    }
  }, [isAdmin, router, user, isLoading, authLoading]);

  useEffect(() => {
    if (!authLoading && isAdmin() && !dataLoaded) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([loadConversations(), loadInvitations()]);
          setDataLoaded(true);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [isAdmin, authLoading, dataLoaded]);

  const loadConversations = async () => {
    try {
      const data = await apiRequest(
        "https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations",
        { method: "GET" }
      );
      if (data.success) {
        let conversations =
          data.conversations || data.data?.conversations || data.data || [];

        // Normaliser les données du backend (snake_case -> camelCase)
        conversations = conversations.map((conv: any) => {
          const normalized: any = {
            id: conv.id,
            participant: conv.participant,
            status: conv.status,
            unreadCount: conv.unread_count || conv.unreadCount || 0,
          };

          // Gérer last_message (snake_case) ou lastMessage (camelCase)
          const lastMsg = conv.last_message || conv.lastMessage;
          if (lastMsg) {
            normalized.lastMessage = {
              content: lastMsg.content,
              timestamp: lastMsg.timestamp,
              isRead:
                lastMsg.is_read !== undefined
                  ? lastMsg.is_read
                  : lastMsg.isRead,
            };
          }

          return normalized;
        });

        setConversations(Array.isArray(conversations) ? conversations : []);
      } else {
        setConversations([]);
      }
    } catch (error) {
      setConversations([]);
    }
  };

  const loadInvitations = async () => {
    try {
      const data = await apiRequest(
        "https://believable-spontaneity-production.up.railway.app/api/admin/chat/invitations",
        { method: "GET" }
      );
      if (data.success) {
        const invitations =
          data.invitations || data.data?.invitations || data.data || [];
        setInvitations(Array.isArray(invitations) ? invitations : []);
      } else {
        setInvitations([]);
      }
    } catch (error) {
      setInvitations([]);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await apiRequest(
        `https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations/${conversationId}/messages`,
        { method: "GET" }
      );
      if (data.success) {
        const messages =
          data.messages || data.data?.messages || data.data || [];
        setMessages(Array.isArray(messages) ? messages : []);
        setTimeout(scrollToBottom, 100);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const data = await apiRequest(
        `https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: newMessage }),
        }
      );
      if (data.success) {
        setMessages((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, data.message];
        });
        setNewMessage("");
        setTimeout(scrollToBottom, 100);
        loadConversations();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const searchAdmins = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const data = await apiRequest(
        `https://believable-spontaneity-production.up.railway.app/api/admin/chat/admins/search?q=${encodeURIComponent(
          query
        )}&limit=10`,
        { method: "GET" }
      );
      if (data.success) {
        const admins = data.data?.admins || data.admins || [];
        setSearchResults(Array.isArray(admins) ? admins : []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    }
  };

  const sendInvitation = async (adminId: string) => {
    try {
      const payload = {
        toUserId: adminId,
        to_user_id: adminId,
        recipient_id: adminId,
        recipientId: adminId,
        message: "Salut, on peut discuter ?",
      };

      const data = await apiRequest(
        "https://believable-spontaneity-production.up.railway.app/api/admin/chat/invitations",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      if (data.success) {
        setShowNewChat(false);
        setSearchQuery("");
        setSearchResults([]);
        loadConversations();
      }
    } catch (error: any) {
      console.error("Erreur:", error);
    }
  };

  const respondToInvitation = async (
    invitationId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const data = await apiRequest(
        `https://believable-spontaneity-production.up.railway.app/api/admin/chat/invitations/${invitationId}/respond`,
        {
          method: "PUT",
          body: JSON.stringify({ action }),
        }
      );
      if (data.success) {
        loadConversations();
        loadInvitations();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);

    setTimeout(() => {
      markConversationAsRead(conversation.id);
    }, 1000);
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      await apiRequest(
        `https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations/${conversationId}/mark-read`,
        { method: "POST" }
      );
      await loadConversations();
    } catch (error) {
      console.error("❌ Erreur marquage lu:", error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");

    if (conversationId && !pendingConversationId && !selectedConversation) {
      setPendingConversationId(conversationId);
    }
  }, [searchParams, pendingConversationId, selectedConversation]);

  useEffect(() => {
    if (
      !pendingConversationId ||
      selectedConversation ||
      conversations.length === 0
    ) {
      return;
    }

    const conversation = conversations.find(
      (c) => c.id === pendingConversationId
    );

    if (conversation && conversation.status === "accepted") {
      handleConversationSelect(conversation);
      setPendingConversationId(null);
      window.history.replaceState({}, "", "/chat");
    } else {
      setPendingConversationId(null);
    }
  }, [pendingConversationId, conversations, selectedConversation]);

  useEffect(() => {
    if (!isAdmin() || authLoading) return;

    const interval = setInterval(() => {
      loadConversations();
      loadInvitations();

      if (selectedConversation && selectedConversation.status === "accepted") {
        loadMessages(selectedConversation.id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAdmin, authLoading, selectedConversation]);

  if (!isAdmin()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // VUE CONVERSATION
  if (selectedConversation) {
    return (
      <div className="fixed inset-0 flex flex-col">
        {/* Fond médiéval */}
        <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 -z-10"></div>
        <div
          className="fixed inset-0 opacity-40 -z-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,175,55,0.2) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Header conversation */}
        <div className="flex-none bg-zinc-900/85 backdrop-blur-3xl border-b border-[#d4af37]/25 shadow-xl px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedConversation(null);
              loadConversations();
            }}
            className="p-2 -ml-2 text-[#d4af37] hover:bg-[#d4af37]/10 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black flex items-center justify-center font-black text-sm shadow-lg shadow-[#d4af37]/30 flex-shrink-0">
            {selectedConversation.participant.firstname.charAt(0)}
            {selectedConversation.participant.lastname.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel font-bold text-white truncate text-sm">
              {selectedConversation.participant.firstname}{" "}
              {selectedConversation.participant.lastname}
            </p>
            <p className="text-xs text-[#d4af37] font-crimson">● En ligne</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mb-3">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-gray-400 text-sm font-crimson">
                Commencez la conversation
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => {
                if (!message) return null;
                const senderId = message.senderId || message.sender_id;
                const isMyMessage = senderId === user?.id;

                return (
                  <div
                    key={message.id || message._id || index}
                    className={`flex ${
                      isMyMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                        isMyMessage
                          ? "bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black"
                          : "bg-zinc-800/60 backdrop-blur-sm text-white border border-[#d4af37]/20"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words font-crimson">
                        {message.content}
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1.5 mt-1.5 text-xs font-crimson ${
                          isMyMessage ? "text-black/60" : "text-gray-400"
                        }`}
                      >
                        <span>
                          {new Date(
                            message.timestamp ||
                              message.created_at ||
                              Date.now()
                          ).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMyMessage && (
                          <>
                            {message.read_at ? (
                              <div className="flex items-center gap-0.5">
                                <svg
                                  className="w-3.5 h-3.5 -mr-1.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            ) : message.delivered_at ? (
                              <div className="flex items-center gap-0.5">
                                <svg
                                  className="w-3.5 h-3.5 -mr-1.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input message */}
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/85 backdrop-blur-3xl border-t border-[#d4af37]/25 p-4 pb-24">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écrire un message..."
              className="flex-1 bg-zinc-800/60 backdrop-blur-sm border border-[#d4af37]/20 rounded-2xl px-5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20 transition-all font-crimson"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black rounded-2xl flex items-center justify-center disabled:opacity-30 shadow-lg shadow-[#d4af37]/30 hover:shadow-[#d4af37]/50 transition-all disabled:shadow-none active:scale-95"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VUE LISTE (reste du code dans le prochain message car limite de longueur)
  return (
    <div className="fixed inset-0 flex flex-col pb-20">
      {/* Fond médiéval */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 -z-10"></div>
      <div
        className="fixed inset-0 opacity-40 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,175,55,0.2) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="fixed top-20 right-10 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-[#c9a74f]/10 rounded-full blur-[120px] -z-10"></div>

      {/* Header */}
      <div className="flex-none bg-zinc-900/85 backdrop-blur-3xl border-b border-[#d4af37]/25 shadow-xl px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#d4af37] hover:text-[#f4d03f] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-cinzel font-bold text-sm tracking-wider">
              RETOUR
            </span>
          </button>
          <h1 className="font-cinzel font-bold text-[#d4af37] text-base tracking-[0.2em]">
            MESSAGES
          </h1>
          <button
            onClick={() => setShowNewChat(true)}
            className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black rounded-xl flex items-center justify-center shadow-lg shadow-[#d4af37]/30 hover:shadow-[#d4af37]/50 transition-all active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-3 rounded-xl font-cinzel font-bold text-sm tracking-wider transition-all ${
              activeTab === "chats"
                ? "bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black shadow-lg shadow-[#d4af37]/30"
                : "bg-zinc-800/40 text-gray-400 hover:text-white"
            }`}
          >
            CONVERSATIONS
            {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                {conversations.filter((c) => c.unreadCount > 0).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={`flex-1 py-3 rounded-xl font-cinzel font-bold text-sm tracking-wider transition-all ${
              activeTab === "invitations"
                ? "bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black shadow-lg shadow-[#d4af37]/30"
                : "bg-zinc-800/40 text-gray-400 hover:text-white"
            }`}
          >
            INVITATIONS
            {invitations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                {invitations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Liste conversations */}
      {activeTab === "chats" && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mb-3">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-gray-400 text-sm font-crimson text-center">
                Aucune conversation
                <br />
                Cliquez sur + pour démarrer
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() =>
                    conv.status === "accepted" && handleConversationSelect(conv)
                  }
                  disabled={conv.status !== "accepted"}
                  className={`w-full bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border border-[#d4af37]/25 rounded-2xl p-4 flex items-center gap-4 transition-all ${
                    conv.status === "accepted"
                      ? "hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/10"
                      : "opacity-40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black flex items-center justify-center font-black text-sm shadow-lg shadow-[#d4af37]/30 flex-shrink-0">
                    {conv.participant.firstname.charAt(0)}
                    {conv.participant.lastname.charAt(0)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-cinzel font-bold text-white text-sm truncate">
                        {conv.participant.firstname} {conv.participant.lastname}
                      </p>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400 font-crimson ml-2 flex-shrink-0">
                          {new Date(
                            conv.lastMessage.timestamp
                          ).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    {conv.status === "pending" ? (
                      <p className="text-xs text-[#d4af37] font-crimson">
                        ⏳ En attente d'acceptation
                      </p>
                    ) : conv.lastMessage ? (
                      <p
                        className={`text-xs font-crimson truncate ${
                          conv.unreadCount > 0
                            ? "text-white font-bold"
                            : "text-gray-400"
                        }`}
                      >
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 font-crimson italic">
                        Nouvelle conversation
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-6 h-6 bg-[#d4af37] text-black rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Liste invitations */}
      {activeTab === "invitations" && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {invitations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mb-3">
                <span className="text-3xl">✉️</span>
              </div>
              <p className="text-gray-400 text-sm font-crimson">
                Aucune invitation
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border border-[#d4af37]/25 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black flex items-center justify-center font-black text-sm shadow-lg shadow-[#d4af37]/30 flex-shrink-0">
                      {inv.fromUser?.firstname?.charAt(0) || "?"}
                      {inv.fromUser?.lastname?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cinzel font-bold text-white text-sm">
                        {inv.fromUser?.firstname} {inv.fromUser?.lastname}
                      </p>
                      <p className="text-xs text-gray-400 font-crimson">
                        {inv.message || "Souhaite vous contacter"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToInvitation(inv.id, "accept")}
                      className="flex-1 py-3 bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black rounded-xl font-cinzel font-bold text-sm hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                    >
                      ACCEPTER
                    </button>
                    <button
                      onClick={() => respondToInvitation(inv.id, "reject")}
                      className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-cinzel font-bold text-sm hover:bg-red-500/20 transition-all"
                    >
                      REFUSER
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal nouvelle conversation */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-gradient-to-br from-zinc-800 to-zinc-900 border border-[#d4af37]/25 rounded-3xl shadow-2xl shadow-[#d4af37]/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-cinzel font-bold text-[#d4af37] text-lg tracking-wider">
                  NOUVELLE CONVERSATION
                </h2>
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchAdmins(e.target.value);
                  }}
                  placeholder="Rechercher un admin..."
                  className="w-full bg-zinc-800/60 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl px-5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20 transition-all font-crimson"
                  autoFocus
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searchQuery.length < 2 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 font-crimson">
                      Tapez au moins 2 caractères
                    </p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((admin) => (
                    <button
                      key={admin.id}
                      onClick={() => sendInvitation(admin.id)}
                      className="w-full bg-zinc-800/40 border border-[#d4af37]/10 rounded-xl p-3 flex items-center gap-3 hover:border-[#d4af37]/30 hover:bg-zinc-800/60 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black flex items-center justify-center font-black text-xs flex-shrink-0">
                        {admin.firstname.charAt(0)}
                        {admin.lastname.charAt(0)}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-cinzel font-bold text-white text-sm truncate">
                          {admin.firstname} {admin.lastname}
                        </p>
                        <p className="text-xs text-gray-400 font-crimson truncate">
                          {admin.email}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 font-crimson">
                      Aucun résultat
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

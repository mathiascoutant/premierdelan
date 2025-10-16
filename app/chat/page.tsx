"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "../config/api";
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiCheck,
  FiClock,
  FiArrowLeft,
  FiSearch,
  FiUsers,
  FiMail,
  FiPlus,
  FiCheckCircle,
} from "react-icons/fi";

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

  // Scroll automatique vers le bas (instantané)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

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
        const conversations =
          data.conversations || data.data?.conversations || data.data || [];
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
    // Marquer comme lu après 1 seconde
    setTimeout(() => {
      markConversationAsRead(conversation.id);
    }, 1000);
  };

  // Marquer la conversation comme lue
  const markConversationAsRead = async (conversationId: string) => {
    try {
      await apiRequest(
        `https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations/${conversationId}/mark-read`,
        { method: "POST" }
      );
    } catch (error) {
      console.error("Erreur marquage lu:", error);
    }
  };

  // Scroll vers le bas quand les messages changent
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0 && !selectedConversation) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation && conversation.status === "accepted") {
        handleConversationSelect(conversation);
      }
    }
  }, [searchParams, conversations, selectedConversation]);

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
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-500 text-sm font-medium tracking-wide">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  // VUE CONVERSATION
  if (selectedConversation) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
        {/* Header luxe */}
        <div className="flex-none bg-black/40 backdrop-blur-sm border-b border-amber-500/20 px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-2 -ml-2 text-amber-500 hover:bg-amber-500/10 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-amber-500/30">
            {selectedConversation.participant.firstname.charAt(0)}
            {selectedConversation.participant.lastname.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate text-sm tracking-wide">
              {selectedConversation.participant.firstname}{" "}
              {selectedConversation.participant.lastname}
            </p>
            <p className="text-xs text-emerald-400 font-medium">● En ligne</p>
          </div>
        </div>

        {/* Messages avec fond élégant */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                <FiMessageCircle className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-gray-400 text-sm font-medium">
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
                          ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                          : "bg-white/5 backdrop-blur-sm text-white border border-white/10"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words font-medium">
                        {message.content}
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1.5 mt-1.5 text-xs font-medium ${
                          isMyMessage ? "text-amber-100" : "text-gray-400"
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
                              // Message vu - 2 coches dorées
                              <div
                                className="flex items-center gap-0.5"
                                title={`Vu à ${new Date(
                                  message.read_at
                                ).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`}
                              >
                                <FiCheck className="w-3.5 h-3.5 -mr-1.5 text-amber-300" />
                                <FiCheck className="w-3.5 h-3.5 text-amber-300" />
                              </div>
                            ) : message.delivered_at ? (
                              // Message distribué - 2 coches grises
                              <div
                                className="flex items-center gap-0.5"
                                title="Distribué"
                              >
                                <FiCheck className="w-3.5 h-3.5 -mr-1.5 text-gray-400" />
                                <FiCheck className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                            ) : (
                              // Message envoyé - 1 coche grise
                              <FiCheck
                                className="w-3.5 h-3.5 text-gray-400"
                                title="Envoyé"
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Élément invisible pour le scroll automatique */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input luxe */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-amber-500/20 p-4 pb-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écrire un message..."
              className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center disabled:opacity-30 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:shadow-none active:scale-95"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VUE LISTE LUXE
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Header prestigieux */}
      <div className="flex-none bg-black/40 backdrop-blur-sm border-b border-amber-500/20 px-6 py-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 tracking-tight">
          Messages
        </h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          {conversations.length} conversation
          {conversations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Contenu avec padding pour nav */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === "chats" ? (
          <div className="p-4 space-y-3">
            {conversations.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <FiMessageCircle className="w-10 h-10 text-amber-500" />
                </div>
                <p className="text-gray-300 text-sm font-medium mb-1">
                  Aucune conversation
                </p>
                <p className="text-gray-500 text-xs mb-6">
                  Démarrez une nouvelle discussion premium
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all active:scale-95"
                >
                  Nouvelle conversation
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() =>
                    conv.status === "accepted" && handleConversationSelect(conv)
                  }
                  disabled={conv.status !== "accepted"}
                  className={`w-full bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-left transition-all ${
                    conv.status === "accepted"
                      ? "hover:bg-white/10 hover:border-amber-500/30 active:scale-98"
                      : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg shadow-amber-500/30">
                      {conv.participant.firstname.charAt(0)}
                      {conv.participant.lastname.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <p className="font-bold text-white text-sm truncate tracking-wide">
                          {conv.participant.firstname}{" "}
                          {conv.participant.lastname}
                        </p>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-500 ml-2 font-medium">
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
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <FiClock className="w-3.5 h-3.5" />
                          <p className="text-xs font-medium">
                            En attente d'acceptation
                          </p>
                        </div>
                      ) : conv.lastMessage ? (
                        <p className="text-sm text-gray-400 truncate font-medium">
                          {conv.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          Nouvelle conversation
                        </p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 font-bold flex-shrink-0 shadow-lg shadow-amber-500/40">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {invitations.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-10 h-10 text-amber-500" />
                </div>
                <p className="text-gray-300 text-sm font-medium">
                  Aucune invitation
                </p>
                <p className="text-gray-500 text-xs mt-1">Vous êtes à jour</p>
              </div>
            ) : (
              invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/20"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg shadow-amber-500/30">
                      {inv.fromUser?.firstname?.charAt(0) || "?"}
                      {inv.fromUser?.lastname?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm mb-1 tracking-wide">
                        {inv.fromUser?.firstname} {inv.fromUser?.lastname}
                      </p>
                      <p className="text-xs text-gray-400 mb-4 font-medium">
                        {inv.message || "Souhaite vous contacter"}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToInvitation(inv.id, "accept")}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all active:scale-95"
                        >
                          <FiCheck className="inline w-4 h-4 mr-1" />
                          Accepter
                        </button>
                        <button
                          onClick={() => respondToInvitation(inv.id, "reject")}
                          className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
                        >
                          <FiX className="inline w-4 h-4 mr-1" />
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAV LUXE */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-amber-500/20 pb-safe">
        <div className="flex items-center justify-around h-20 px-2">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all ${
              activeTab === "chats"
                ? "text-amber-500"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            <FiMessageCircle className="w-6 h-6" />
            <span className="text-xs font-bold tracking-wide">Discussions</span>
            {activeTab === "chats" && (
              <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mt-0.5" />
            )}
          </button>

          <button
            onClick={() => setShowNewChat(true)}
            className="w-16 h-16 -mt-10 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-xl shadow-amber-500/40 flex items-center justify-center active:scale-95 transition-all hover:shadow-2xl hover:shadow-amber-500/60"
          >
            <FiPlus className="w-8 h-8" />
          </button>

          <button
            onClick={() => setActiveTab("invitations")}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 relative transition-all ${
              activeTab === "invitations"
                ? "text-amber-500"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            <FiMail className="w-6 h-6" />
            <span className="text-xs font-bold tracking-wide">Invitations</span>
            {invitations.length > 0 && (
              <span className="absolute top-1 right-8 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-bold shadow-lg shadow-red-500/50">
                {invitations.length}
              </span>
            )}
            {activeTab === "invitations" && (
              <div className="w-12 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mt-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Modal luxe */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-gradient-to-br from-gray-900 to-black w-full rounded-t-3xl max-h-[90vh] flex flex-col border-t border-amber-500/20">
            <div className="p-6 border-b border-amber-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Nouvelle conversation
                </h2>
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un administrateur..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchAdmins(e.target.value);
                  }}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm font-medium"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery.length < 2 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="w-8 h-8 text-amber-500" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">
                    Tapez au moins 2 caractères
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    pour lancer la recherche
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-amber-500/30">
                          {admin.firstname.charAt(0)}
                          {admin.lastname.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate tracking-wide">
                            {admin.firstname} {admin.lastname}
                          </p>
                          <p className="text-xs text-gray-500 truncate font-medium">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => sendInvitation(admin.id)}
                        className="ml-3 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all active:scale-95"
                      >
                        Inviter
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <FiUsers className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">
                    Aucun résultat
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Essayez une autre recherche
                  </p>
                </div>
              )}
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
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

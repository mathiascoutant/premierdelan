"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { apiRequest } from "../config/api";
import {
  FiSearch,
  FiPlus,
  FiMessageCircle,
  FiSend,
  FiMoreVertical,
  FiCheck,
  FiX,
  FiClock,
  FiArrowLeft,
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
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

export default function ChatPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (!isAdmin()) {
      router.push("/");
    }
  }, [isAdmin, router]);

  // Charger les conversations
  useEffect(() => {
    if (isAdmin()) {
      loadConversations();
      loadInvitations();
    }
  }, [isAdmin]);

  const loadConversations = async () => {
    try {
      const data = await apiRequest(
        "https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations",
        { method: "GET" }
      );

      if (data.success) {
        setConversations(data.conversations);
      } else {
        console.error("Erreur API:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
    } finally {
      setIsLoading(false);
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
        setSearchResults(data.admins);
      } else {
        console.error("Erreur API:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    }
  };

  const sendInvitation = async (adminId: string) => {
    try {
      const data = await apiRequest(
        "https://believable-spontaneity-production.up.railway.app/api/admin/chat/invitations",
        {
          method: "POST",
          body: JSON.stringify({
            toUserId: adminId,
            message: "Salut, on peut discuter ?",
          }),
        }
      );

      if (data.success) {
        console.log("Invitation envoyée avec succès");
        setShowNewChat(false);
        setSearchQuery("");
        setSearchResults([]);
      } else {
        console.error("Erreur API:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const data = await apiRequest(
        `https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: newMessage,
          }),
        }
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      } else {
        console.error("Erreur API:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await apiRequest(
        `https://believable-spontaneity-production.up.railway.app/api/admin/chat/conversations/${conversationId}/messages`,
        { method: "GET" }
      );

      if (data.success) {
        setMessages(data.messages);
      } else {
        console.error("Erreur API:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  };

  const loadInvitations = async () => {
    try {
      const data = await apiRequest(
        "https://believable-spontaneity-production.up.railway.app/api/admin/chat/invitations",
        { method: "GET" }
      );

      if (data.success) {
        setInvitations(data.invitations);
      } else {
        console.error("Erreur API:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des invitations:", error);
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
        // Recharger les conversations et invitations
        loadConversations();
        loadInvitations();
      } else {
        console.error("Erreur API:", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la réponse à l'invitation:", error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès refusé
          </h1>
          <p className="text-gray-600">
            Seuls les administrateurs peuvent accéder au chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`w-80 bg-white border-r border-gray-200 flex flex-col ${
          selectedConversation ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Chat Admin</h1>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un admin..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchAdmins(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Invitations reçues */}
        {invitations.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Invitations reçues
              </h3>
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {invitation.fromUser.firstname.charAt(0)}
                      {invitation.fromUser.lastname.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invitation.fromUser.firstname}{" "}
                        {invitation.fromUser.lastname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {invitation.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        respondToInvitation(invitation.id, "accept")
                      }
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors"
                    >
                      <FiCheck className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        respondToInvitation(invitation.id, "reject")
                      }
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {showNewChat && searchResults.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Résultats de recherche
              </h3>
              {searchResults.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {admin.firstname.charAt(0)}
                      {admin.lastname.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {admin.firstname} {admin.lastname}
                      </p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => sendInvitation(admin.id)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Chargement...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center">
              <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">Aucune conversation</p>
              <p className="text-xs text-gray-400 mt-1">
                Recherchez un admin pour commencer
              </p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {conversation.participant.firstname.charAt(0)}
                        {conversation.participant.lastname.charAt(0)}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participant.firstname}{" "}
                          {conversation.participant.lastname}
                        </p>
                        {conversation.status === "pending" && (
                          <FiClock className="w-4 h-4 text-orange-500" />
                        )}
                        {conversation.status === "accepted" && (
                          <FiCheck className="w-4 h-4 text-green-500" />
                        )}
                        {conversation.status === "rejected" && (
                          <FiX className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {conversation.lastMessage &&
                          new Date(
                            conversation.lastMessage.timestamp
                          ).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${
          !selectedConversation ? "hidden lg:flex" : "flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {selectedConversation.participant.firstname.charAt(0)}
                    {selectedConversation.participant.lastname.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.participant.firstname}{" "}
                      {selectedConversation.participant.lastname}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.participant.email}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                  <FiMoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user?.id
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user?.id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FiMessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sélectionnez une conversation
              </h2>
              <p className="text-gray-500">
                Choisissez une conversation dans la liste pour commencer à
                discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

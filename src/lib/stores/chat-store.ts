import { create } from "zustand";
import type { Message, ToolCall } from "../types";

interface ChatState {
  // Conversation active
  activeConversationId: string | null;
  activeConversationTitle: string | null;
  setActiveConversation: (id: string | null) => void;
  setActiveConversationTitle: (title: string | null) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastAssistantMessage: (content: string) => void;

  // Streaming
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamingContent: string;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (delta: string) => void;

  // Tool calls
  activeToolCalls: ToolCall[];
  addToolCall: (toolCall: ToolCall) => void;
  updateToolCallResult: (id: string, output: Record<string, unknown>) => void;
  clearToolCalls: () => void;

  // Reset
  resetChat: () => void;
  startNewConversation: () => void;
}

const initialState = {
  activeConversationId: null,
  activeConversationTitle: null,
  messages: [],
  isStreaming: false,
  streamingContent: "",
  activeToolCalls: [],
};

export const useChatStore = create<ChatState>()((set) => ({
  ...initialState,

  // Conversation
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setActiveConversationTitle: (title) => set({ activeConversationTitle: title }),

  // Messages
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  updateLastAssistantMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "ASSISTANT") {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { messages: msgs };
    }),

  // Streaming
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  appendStreamingContent: (delta) =>
    set((s) => ({ streamingContent: s.streamingContent + delta })),

  // Tool calls
  addToolCall: (toolCall) =>
    set((s) => ({ activeToolCalls: [...s.activeToolCalls, toolCall] })),
  updateToolCallResult: (id, output) =>
    set((s) => ({
      activeToolCalls: s.activeToolCalls.map((tc) =>
        tc.id === id ? { ...tc, output } : tc,
      ),
    })),
  clearToolCalls: () => set({ activeToolCalls: [] }),

  // Reset
  resetChat: () => set(initialState),
  startNewConversation: () =>
    set({
      activeConversationId: null,
      activeConversationTitle: null,
      messages: [],
      isStreaming: false,
      streamingContent: "",
      activeToolCalls: [],
    }),
}));

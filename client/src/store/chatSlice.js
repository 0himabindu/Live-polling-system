import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  isChatOpen: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    toggleChat: (state) => {
      state.isChatOpen = !state.isChatOpen;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, toggleChat, clearMessages } = chatSlice.actions;

export default chatSlice.reducer; 
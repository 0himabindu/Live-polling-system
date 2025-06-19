import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  pollResults: null,
  isPollActive: false,
  timeRemaining: 60,
  pastPolls: [],
};

export const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setCurrentPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.isPollActive = true;
      state.timeRemaining = action.payload.timeLimit || 60;
    },
    setPollResults: (state, action) => {
      state.pollResults = action.payload;
    },
    endPoll: (state) => {
      state.isPollActive = false;
      state.currentPoll = null;
      state.timeRemaining = 60;
    },
    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    addPastPoll: (state, action) => {
      state.pastPolls.push(action.payload);
    },
    resetPoll: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentPoll,
  setPollResults,
  endPoll,
  updateTimeRemaining,
  addPastPoll,
  resetPoll,
} = pollSlice.actions;

export default pollSlice.reducer; 
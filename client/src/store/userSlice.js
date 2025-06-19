import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: null, // 'teacher' or 'student'
  name: null,
  id: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setTeacher: (state) => {
      state.role = 'teacher';
      state.name = 'Teacher';
      state.isAuthenticated = true;
    },
    setStudent: (state, action) => {
      state.role = 'student';
      state.name = action.payload.name;
      state.id = action.payload.id;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      return initialState;
    },
  },
});

export const { setTeacher, setStudent, logout } = userSlice.actions;

export default userSlice.reducer; 
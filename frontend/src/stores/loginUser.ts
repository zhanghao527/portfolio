import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_USER } from "@/constants/user";

export const loginUserSlice = createSlice({
  name: "loginUser",
  initialState: DEFAULT_USER,
  reducers: {
    setLoginUser: (_state, action: PayloadAction<API.LoginUserVO>) => {
      return { ...action.payload };
    },
  },
});

export const { setLoginUser } = loginUserSlice.actions;
export default loginUserSlice.reducer;

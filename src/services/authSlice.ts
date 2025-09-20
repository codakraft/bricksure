import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authService";
import { RootState } from "../store/store";
// import { AuthUserData } from "../types";

// Types for the auth state
interface User {
  _id: string;
  email: string;
  isVerified: boolean;
}

export interface IMyBankInitialState {
  status:
    | "signup"
    | "signup-success"
    | "signup-error"
    | "idle"
    | "loading"
    | "login-success"
    | "login-error"
    | "login";
  authData: User;
  token?: string | null;
  isAuthenticated: boolean;
//   authUser: AuthUserData | null;
}

const initState: IMyBankInitialState = {
  status: "idle",
  authData: {
    _id: "",
    email: "",
    isVerified: false,
  },
  token: "",
  isAuthenticated: false,
//   authUser: null,
};

// Check localStorage for existing authentication on app initialization
const token = localStorage.getItem("bricksure-token");
const storedUser = localStorage.getItem("bricksure-user");

if (token && storedUser) {
  try {
    const userData = JSON.parse(storedUser);
    initState.token = token;
    initState.authData = userData;
    initState.isAuthenticated = true;
    initState.status = "login-success";
  } catch {
    // If parsing fails, clear the stored data
    localStorage.removeItem("bricksure-token");
    localStorage.removeItem("bricksure-user");
  }
}

export const authSlice = createSlice({
  name: "auth",
  initialState: initState,
  reducers: {
    logout: (state) => {
      state.status = "idle";
      state.authData = {
        _id: "",
        email: "",
        isVerified: false,
      };
      state.token = "";
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("bricksure-token");
      localStorage.removeItem("bricksure-user");
    },
    login: (state) => {
      state.status = "signup";
    },
    loginSuccess: (state) => {
      state.status = "login-success";
      state.isAuthenticated = true;
    },
    loginError: (state) => {
      state.status = "login-error";
      state.isAuthenticated = false;
    },
    signupSuccess: (state) => {
      state.status = "signup-success";
    },
    signupError: (state) => {
      state.status = "signup-error";
      state.isAuthenticated = false;
    },
    authenticate: (state) => {
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.signUp.matchPending, (state) => {
      state.status = "signup";
    });
    builder.addMatcher(
      authApi.endpoints.signUp.matchFulfilled,
      (state, { payload }) => {
        const { data, token } = payload;
        console.log("Accessout", payload);
        if (data && token) {
          console.log("Data", data);
          state.authData = {
            ...data,
          };
          localStorage.setItem("bricksure-token", token);
          localStorage.setItem("bricksure-user", JSON.stringify(data));
          state.token = token;

          state.status = "signup-success";
          state.isAuthenticated = true;

          return;
        }
        state.status = "signup-error";
        state.isAuthenticated = false;

        return;
      }
    );
    builder.addMatcher(authApi.endpoints.login.matchRejected, (state) => {
      state.status = "signup-error";
      state.isAuthenticated = false;

      return;
    });
    builder.addMatcher(authApi.endpoints.login.matchPending, (state) => {
      state.status = "login";
    });
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        const { data, token } = payload;
        console.log("LoginSlice", payload);
        if (!data?.isVerified) {
          state.isAuthenticated = false;
          localStorage.setItem("bricksure-token", token);
          state.token = token;
          //   state.status = "login-success";
          return;
        }
        if (data && token) {
          console.log("Data", data);
          state.authData = {
            ...data,
          };
          localStorage.setItem("bricksure-token", token);
          localStorage.setItem("bricksure-user", JSON.stringify(data));
          state.token = token;

          state.status = "login-success";
          state.isAuthenticated = true;

          return;
        }
        state.status = "login-error";
        state.isAuthenticated = false;

        return;
      }
    );
    builder.addMatcher(
      authApi.endpoints.verifyEmail.matchFulfilled,
      (state) => {
        state.isAuthenticated = true;
        state.status = "login-success";

        return;
      }
    );
    // builder.addMatcher(
    //   authApi.endpoints.getUser.matchFulfilled,
    //   (state, { payload }) => {
    //     const { data } = payload;
    //     console.log("UserSlice", payload);
    //     if (data) {
    //       console.log("Data", data);
    //       state.authUser = {
    //         ...data,
    //       };

    //       state.status = "login-success";

    //       return;
    //     }
    //     state.status = "login-error";
    //     state.isAuthenticated = false;

    //     return;
    //   }
    // );
  },
});

export const {
  logout,
  login,
  signupSuccess,
  authenticate,
  loginError,
  loginSuccess,
} = authSlice.actions;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectCustomerInfo = (state: RootState) => state.auth.authData;
export default authSlice.reducer;

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Replace with your own OAuth credentials
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';

type AuthAction =
  | { type: 'SIGN_IN'; payload: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<{
  state: AuthState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}>({
  state: initialState,
  signIn: async () => {},
  signOut: async () => {},
});

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SIGN_IN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    // Check for stored user data on app start
    const checkUserSession = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          dispatch({ type: 'SIGN_IN', payload: JSON.parse(userData) });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkUserSession();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Fetch user info with the access token
      fetchUserInfo(authentication?.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token?: string) => {
    if (!token) return;

    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userInfo = await response.json();
      
      // Create a user object from Google profile
      const user: User = {
        id: parseInt(userInfo.id, 10) || Math.floor(Math.random() * 1000),
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.picture,
      };

      // Save user to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'SIGN_IN', payload: user });
    } catch (error) {
      console.error('Error fetching user info:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signIn = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await promptAsync();
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
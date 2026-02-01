import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { useAuthModal, useAuthStore, authKey } from './store';
import { authWithApple } from '@/utils/api';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(() => {
    SecureStore.getItemAsync(authKey).then((auth) => {
      useAuthStore.setState({
        auth: auth ? JSON.parse(auth) : null,
        isReady: true,
      });
    });
  }, []);

  useEffect(() => {}, []);

  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);
  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);

  const signOut = useCallback(() => {
    setAuth(null);
    close();
  }, [close, setAuth]);

  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      throw new Error('Sign in with Apple is only available on iOS');
    }
    const { signInAsync, AppleAuthenticationScope } = await import('expo-apple-authentication');
    if (typeof signInAsync !== 'function') {
      throw new Error('Apple Sign-In is not available on this device (e.g. use a real iPhone, not simulator)');
    }
    const credential = await signInAsync({
      requestedScopes: [
        AppleAuthenticationScope.FULL_NAME,
        AppleAuthenticationScope.EMAIL,
      ],
    });
    const identityToken = credential?.identityToken;
    if (!identityToken) throw new Error('No identity token from Apple');
    const fullName = credential?.fullName;
    const name = fullName
      ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ').trim() || null
      : null;
    console.log('[Auth] Calling backend with Apple identityToken...', name ? `name="${name}"` : 'no name in credential');
    const result = await authWithApple(identityToken, name);
    setAuth(result);
    close();
    return result;
  }, [setAuth, close]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    signInWithApple,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;
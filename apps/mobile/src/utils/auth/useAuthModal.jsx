import React, { useMemo } from 'react';
import { Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthWebView } from './AuthWebView';
import { AuthNativeOptions } from './AuthNativeOptions';
import { useAuthStore, useAuthModal } from './store';

/**
 * Renders the auth modal. When proxy/baseURL are set, shows WebView auth;
 * otherwise shows native "Sign in with Apple" and "Sign in with Google".
 */
export const AuthModal = () => {
  const { isOpen, mode, close } = useAuthModal();
  const { auth } = useAuthStore();
  const insets = useSafeAreaInsets();

  const proxyURL = process.env.EXPO_PUBLIC_PROXY_BASE_URL;
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  const useWebView = !!(proxyURL || baseURL);
  const visible = isOpen && !auth;

  if (!visible) return null;

  if (useWebView) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <AuthWebView mode={mode} proxyURL={proxyURL} baseURL={baseURL || proxyURL} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <AuthNativeOptions onClose={close} />
        </View>
      </View>
    </Modal>
  );
};

export default useAuthModal;
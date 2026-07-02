import React, { forwardRef, useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import jssdk from '@htyf-mp/js-sdk';
import Pages from './entry';

const MiniApp = forwardRef(() => {
    useEffect(() => {
        const tryShowInterstitialAd = async () => {
          return;
          const INTERSTITIAL_AD_STORAGE_KEY = 'interstitial_ad_last_shown_at';
          /** 冷却时间（毫秒），此时间内只调用一次 showInterstitialAd */
          const INTERSTITIAL_AD_COOLDOWN_MS = 8 * 60 * 1000;
          const storage = jssdk.getStorage();
          const lastShownRaw = await storage.getItem(INTERSTITIAL_AD_STORAGE_KEY);
          const now = Date.now();
          const lastShown = lastShownRaw ? Number(lastShownRaw) : 0;
    
          if (lastShown && now - lastShown < INTERSTITIAL_AD_COOLDOWN_MS) {
            return;
          }
    
          await storage.setItem(INTERSTITIAL_AD_STORAGE_KEY, String(now));
          jssdk.showInterstitialAd({
            onOpen: () => {
              console.log('onOpen');
            },
            onClose: () => {
              console.log('onClose');
            },
          });
        };
    
        tryShowInterstitialAd();
      }, []);
    return <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
    >
        <Pages />
    </KeyboardAvoidingView>;
});

export default MiniApp;

import React, { forwardRef } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Pages from './entry';

const MiniApp = forwardRef(() => {
    return <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
    >
        <Pages />
    </KeyboardAvoidingView>;
});

export default MiniApp;

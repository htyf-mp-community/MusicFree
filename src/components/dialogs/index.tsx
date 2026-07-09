import React from 'react';
import components from './components';
import {dialogInfoStore} from './useDialog';
import Portal from '../base/portal';

export default function () {
    const dialogInfoState = dialogInfoStore.useValue();

    const Component = dialogInfoState.name
        ? components[dialogInfoState.name]
        : null;

    console.error(dialogInfoState.name, dialogInfoState.payload, Component);
    return (
        <Portal>
            {Component ? (
                <Component {...(dialogInfoState.payload ?? {})} />
            ) : null}
        </Portal>
    );
}

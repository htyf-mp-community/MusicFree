import {useMemo} from 'react';
import {PixelRatio, useWindowDimensions} from 'react-native';
import jssdk from '@htyf-mp/js-sdk';
import {capsuleOccupiedRightInset} from '@/utils/capsuleLayout';

/** Keeps toolbar controls to the left of the HTYF capsule without moving the row. */
export default function useCapsuleRightInset(safetyGap = 10): number {
    const window = useWindowDimensions();
    return useMemo(
        () =>
            capsuleOccupiedRightInset(
                jssdk.getMenuButtonBoundingClientRect(),
                window.width,
                PixelRatio.get(),
                safetyGap,
            ),
        [safetyGap, window.width],
    );
}

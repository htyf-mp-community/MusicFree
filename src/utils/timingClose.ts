import TrackPlayer from '@/core/trackPlayer';
import NativeUtils from '@/native/utils';
import StateMapper from '@/utils/stateMapper';
import {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import BackgroundTimer from '@boterop/react-native-background-timer';
// import TrackPlayer from "react-native-track-player";

let deadline: number | null = null;
const stateMapper = new StateMapper(() => deadline);
// let closeAfterPlayEnd = false;
// const closeAfterPlayEndStateMapper = new StateMapper(() => closeAfterPlayEnd);
let timerId: any;

function setTimingClose(_deadline: number | null) {
    deadline = _deadline;
    stateMapper.notify();
    timerId && BackgroundTimer.clearTimeout(timerId);
    if (_deadline) {
        timerId = BackgroundTimer.setTimeout(async () => {
            // todo: 播完整首歌再关闭
            await TrackPlayer.reset();
            NativeUtils.exitApp();
            // if(closeAfterPlayEnd) {
            //     TrackPlayer.addEventListener()
            // } else {
            //     // 立即关闭
            //     NativeUtils.exitApp();
            // }
        }, _deadline - Date.now());
    } else {
        timerId = null;
    }
}

function useTimingClose() {
    const _deadline = stateMapper.useMappedState();
    const [countDown, setCountDown] = useState(
        deadline ? deadline - Date.now() : null,
    );
    const intervalRef = useRef<any>();

    useEffect(() => {
        intervalRef.current && clearInterval(intervalRef.current);
        intervalRef.current = null;

        if (!_deadline || _deadline <= Date.now()) {
            setCountDown(null);
            return;
        }

        const tick = () => {
            setCountDown(Math.max(_deadline - Date.now(), 0) / 1000);
        };

        const startUiInterval = () => {
            intervalRef.current && clearInterval(intervalRef.current);
            intervalRef.current = setInterval(tick, 1000);
        };

        tick();

        const onAppStateChange = () => {
            if (AppState.currentState === 'background') {
                intervalRef.current && clearInterval(intervalRef.current);
                intervalRef.current = null;
                return;
            }
            tick();
            startUiInterval();
        };

        if (AppState.currentState !== 'background') {
            startUiInterval();
        }

        const sub = AppState.addEventListener('change', onAppStateChange);
        return () => {
            sub.remove();
            intervalRef.current && clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, [_deadline]);

    return countDown;
}

export {setTimingClose, useTimingClose};

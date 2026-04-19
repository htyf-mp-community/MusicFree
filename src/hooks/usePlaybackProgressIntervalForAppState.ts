import {useEffect} from 'react';
import {AppState} from 'react-native';
import RNTrackPlayer from 'react-native-track-player';

/** 与 bootstrap 初始值一致 */
const INTERVAL_FOREGROUND_SEC = 1;
/** 后台降低 PlaybackProgressUpdated / useProgress 频率，减轻 JS 与持久化压力 */
const INTERVAL_BACKGROUND_SEC = 3;

/**
 * 根据前后台切换动态调整 progress 上报间隔（仅影响已初始化的播放器选项）。
 */
export function usePlaybackProgressIntervalForAppState() {
    useEffect(() => {
        const apply = () => {
            const isBackground = AppState.currentState === 'background';
            RNTrackPlayer.updateOptions({
                progressUpdateEventInterval: isBackground
                    ? INTERVAL_BACKGROUND_SEC
                    : INTERVAL_FOREGROUND_SEC,
            }).catch(() => {});
        };

        apply();
        const sub = AppState.addEventListener('change', apply);
        return () => sub.remove();
    }, []);
}

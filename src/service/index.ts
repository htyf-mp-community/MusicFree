import Config from "@/core/config.ts";
import RNTrackPlayer, { Event, State } from "react-native-track-player";
import LyricManager from "@/core/lyricManager";
import LyricUtil from "@/native/lyricUtil";
import TrackPlayer from "@/core/trackPlayer";
import { musicIsPaused } from "@/utils/trackUtils";
import PersistStatus from "@/core/persistStatus.ts";

let resumeState: State | null;
module.exports = async function () {
    RNTrackPlayer.addEventListener(Event.RemotePlay, () => {
        try {
            TrackPlayer.play();
        } catch (error) {
            console.error(error);
        }
    });
    RNTrackPlayer.addEventListener(Event.RemotePause, () => {
        try {
            TrackPlayer.pause();
        } catch (error) {
            console.error(error);
        }
    });
    RNTrackPlayer.addEventListener(Event.RemotePrevious, () => {
        try {
            TrackPlayer.skipToPrevious();
        } catch (error) {
            console.error(error);
        }
    });
    RNTrackPlayer.addEventListener(Event.RemoteNext, () => {
        try {
            TrackPlayer.skipToNext();
        } catch (error) {
            console.error(error);
        }
    });
    RNTrackPlayer.addEventListener(
        Event.RemoteDuck,
        async ({paused, permanent}) => {
            if (Config.getConfig('basic.notInterrupt')) {
                return;
            }
            if (permanent) {
                return TrackPlayer.pause();
            }
            const tempRemoteDuckConf = Config.getConfig(
                'basic.tempRemoteDuck',
            );
            if (tempRemoteDuckConf === '降低音量') {
                if (paused) {
                    return RNTrackPlayer.setVolume(0.5);
                } else {
                    return RNTrackPlayer.setVolume(1);
                }
                if (permanent) {
                    return TrackPlayer.pause();
                }
                const tempRemoteDuckConf = Config.get(
                    'setting.basic.tempRemoteDuck',
                );
                if (tempRemoteDuckConf === '降低音量') {
                    if (paused) {
                        return RNTrackPlayer.setVolume(0.5);
                    } else {
                        return RNTrackPlayer.setVolume(1);
                    }
                } else {
                    if (paused) {
                        resumeState =
                            (await RNTrackPlayer.getPlaybackState()).state ??
                            State.Paused;
                        return TrackPlayer.pause();
                    } else {
                        if (resumeState && !musicIsPaused(resumeState)) {
                            resumeState = null;
                            return TrackPlayer.play();
                        }
                        resumeState = null;
                    }
                }
            } catch (error) {
                console.error(error);
            }
        },
    );

    RNTrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, () => {
        try {
            const currentMusicItem = TrackPlayer.getCurrentMusic();
            if (currentMusicItem) {
                LyricUtil.setStatusBarLyricText(
                    `${currentMusicItem.title} - ${currentMusicItem.artist}`,
                );
            }
        } catch (error) {
            console.error(error);
        }
    });

    RNTrackPlayer.addEventListener(Event.PlaybackProgressUpdated, evt => {
        PersistStatus.set('music.progress', evt.position);

        // 歌词逻辑
        const parser = LyricManager.getLyricState().lyricParser;
        if (parser) {
            const prevLyricText = LyricManager.getCurrentLyric()?.lrc;
            const currentLyricItem = parser.getPosition(evt.position);
            if (prevLyricText !== currentLyricItem?.lrc) {
                LyricManager.setCurrentLyric(currentLyricItem ?? null);
                const showTranslation = PersistStatus.get(
                    'lyric.showTranslation',
                );
                if (Config.getConfig('lyric.showStatusBarLyric')) {
                    LyricUtil.setStatusBarLyricText(
                        (currentLyricItem?.lrc ?? '') +
                            (showTranslation
                                ? `\n${currentLyricItem?.translation ?? ''}`
                                : ''),
                    );
                    if (Config.get('setting.lyric.showStatusBarLyric')) {
                        LyricUtil.setStatusBarLyricText(
                            (currentLyricItem?.lrc ?? '') +
                                (showTranslation
                                    ? `\n${
                                          parser.getTranslationLyric()?.[
                                              currentLyricItem?.index!
                                          ]?.lrc || ''
                                      }`
                                    : ''),
                        );
                    }
                }
            }
        }
    });

    RNTrackPlayer.addEventListener(Event.RemoteStop, async () => {
        try {
            RNTrackPlayer.stop();
        } catch (error) {
            console.error(error);
        }
    });

    RNTrackPlayer.addEventListener(Event.RemoteSeek, async evt => {
        try {
            TrackPlayer.seekTo(evt.position);
        } catch (error) {
            console.error(error);
        }
    });
};

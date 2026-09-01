/**
 * 管理当前歌曲的歌词
 */

import { isSameMediaItem } from "@/utils/mediaItem";
import PluginManager from "./pluginManager.ts";
import LyricParser, { IParsedLrcItem } from "@/utils/lrcParser";
import { GlobalState } from "@/utils/stateMapper";
import { EDeviceEvents } from "@/constants/commonConst";
import { DeviceEventEmitter, NativeEventSubscription } from "react-native";
import RNTrackPlayer, {Event} from 'react-native-track-player';
import Config from "./config.ts";
import LyricUtil from "@/native/lyricUtil";
import TrackPlayer from "./trackPlayer/index.ts";
import MediaExtra from "./mediaExtra.ts";
import minDistance from "@/utils/minDistance";
import PersistStatus from '@/core/persistStatus';
import {syncLyricAtPosition} from '@/core/lyricProgress';

interface ILyricState {
  loading: boolean;
  lyricParser?: LyricParser;
  lyrics: IParsedLrcItem[];
  meta?: Record<string, string>;
  hasTranslation: boolean;
}

const defaultLyricState = {
  loading: true,
  lyrics: [],
  hasTranslation: false
};

const lyricStateStore = new GlobalState<ILyricState>(defaultLyricState);
const currentLyricStore = new GlobalState<IParsedLrcItem | null>(null);
let playbackProgressSubscription: NativeEventSubscription | null = null;

function resetLyricState() {
  lyricStateStore.setValue(defaultLyricState);
}

// 重新获取歌词
async function refreshLyric(fromStart?: boolean, forceRequest = false) {
  const musicItem = TrackPlayer.getCurrentMusic();
  try {
    if (!musicItem) {
      lyricStateStore.setValue({
        loading: false,
        lyrics: [],
        hasTranslation: false
      });

      currentLyricStore.setValue({
        index: 0,
        lrc: "MusicFree",
        time: 0
      });

      return;
    }

    const currentParserMusicItem =
      lyricStateStore.getValue()?.lyricParser?.musicItem;

    let lrcSource: ILyric.ILyricSource | null | undefined;
    if (
      forceRequest ||
      !isSameMediaItem(currentParserMusicItem, musicItem)
    ) {
      resetLyricState();
      currentLyricStore.setValue(null);

      lrcSource = await PluginManager.getByMedia(
        musicItem
      )?.methods?.getLyric(musicItem);
    } else {
      lrcSource = lyricStateStore.getValue().lyricParser?.lyricSource;
    }

    if (!lrcSource && Config.getConfig("lyric.autoSearchLyric")) {
      const keyword = musicItem.alias || musicItem.title;
      const plugins = PluginManager.getSearchablePlugins("lyric");

      let distance = Infinity;
      let minDistanceMusicItem;
      let targetPlugin;

      for (let plugin of plugins) {
        const realtimeMusicItem = TrackPlayer.getCurrentMusic();
        if (
          !isSameMediaItem(musicItem, realtimeMusicItem) ||
          plugin.name === musicItem.platform
        ) {
          return;
        }
        const results = await plugin.methods
          .search(keyword, 1, "lyric")
          .catch(() => null);

        // 取前两个
        const firstTwo = results?.data?.slice(0, 2) || [];

        for (let item of firstTwo) {
          if (
            item.title === keyword &&
            item.artist === musicItem.artist
          ) {
            distance = 0;
            minDistanceMusicItem = item;
            targetPlugin = plugin;
            break;
          } else {
            const dist =
              minDistance(keyword, musicItem.title) +
              minDistance(item.artist, musicItem.artist);
            if (dist < distance) {
              distance = dist;
              minDistanceMusicItem = item;
              targetPlugin = plugin;
            }
          }
        }

        if (distance === 0) {
          break;
        }
      }
      if (minDistanceMusicItem && targetPlugin) {
        lrcSource = await targetPlugin.methods
          .getLyric(minDistanceMusicItem)
          .catch(() => null);
      }
    }

    const realtimeMusicItem = TrackPlayer.getCurrentMusic();
    if (isSameMediaItem(musicItem, realtimeMusicItem)) {
      if (lrcSource) {
        const mediaExtra = MediaExtra.get(musicItem);
        const parser = new LyricParser(lrcSource.rawLrc!, {
          extra: {
            offset: (mediaExtra?.lyricOffset || 0) * -1
          },
          musicItem: musicItem,
          lyricSource: lrcSource,
          translation: lrcSource.translation
        });

        lyricStateStore.setValue({
          loading: false,
          lyricParser: parser,
          lyrics: parser.getLyricItems(),
          hasTranslation: parser.hasTranslation,
          meta: parser.getMeta()
        });
        // 更新当前状态的歌词
        const currentLyric = fromStart
          ? parser.getLyricItems()[0]
          : parser.getPosition(
            (await TrackPlayer.getProgress()).position
          );
        currentLyricStore.setValue(currentLyric || null);
      } else {
        // 没有歌词
        lyricStateStore.setValue({
          loading: false,
          lyrics: [],
          hasTranslation: false
        });
      }
    }
  } catch (e) {
    console.log(e, "LRC");
    const realtimeMusicItem = TrackPlayer.getCurrentMusic();
    if (isSameMediaItem(musicItem, realtimeMusicItem)) {
      // 异常情况
      lyricStateStore.setValue({
        loading: false,
        lyrics: [],
        hasTranslation: false
      });
    }
  }
}

/** Updates the UI and optional status-bar lyric from a player progress event. */
function updateCurrentLyricForPosition(position: number): IParsedLrcItem | null {
  const parser = lyricStateStore.getValue().lyricParser;
  if (!parser) {
    return currentLyricStore.getValue();
  }

  // lyricStateStore 在切歌时会先重置，再安装新 parser。这里不能再次用
  // media identity 拦截：HTYF 播放队列会重建 Track 对象，旧对象与当前
  // Track 的平台字段可能短暂不一致，导致页面进度永久停在第一句。

  const previous = currentLyricStore.getValue();
  const current = syncLyricAtPosition(
    position,
    parser,
    previous,
    currentLyricStore.setValue,
  );

  if (
    previous?.index !== current?.index &&
    Config.getConfig('lyric.showStatusBarLyric')
  ) {
    const showTranslation = PersistStatus.get('lyric.showTranslation');
    LyricUtil.setStatusBarLyricText(
      (current?.lrc ?? '') +
      (showTranslation ? `\n${current?.translation ?? ''}` : ''),
    );
  }
  return current;
}

// 获取歌词
async function setup() {
  DeviceEventEmitter.addListener(EDeviceEvents.REFRESH_LYRIC, refreshLyric);

  // HTYF 的 playback service 可能运行在与页面不同的 JS 上下文；页面侧必须
  // 自己订阅进度事件，才能推动 GlobalState hook 和歌词列表滚动。
  if (!playbackProgressSubscription) {
    playbackProgressSubscription = RNTrackPlayer.addEventListener(
      Event.PlaybackProgressUpdated,
      event => updateCurrentLyricForPosition(event.position),
    );
  }

  if (Config.getConfig("lyric.showStatusBarLyric")) {

    const statusBarLyricConfig = {
      topPercent: Config.getConfig("lyric.topPercent"),
      leftPercent: Config.getConfig("lyric.leftPercent"),
      align: Config.getConfig("lyric.align"),
      color: Config.getConfig("lyric.color"),
      backgroundColor: Config.getConfig("lyric.backgroundColor"),
      widthPercent: Config.getConfig("lyric.widthPercent"),
      fontSize: Config.getConfig("lyric.fontSize")
    };
    LyricUtil.showStatusBarLyric(
      "MusicFree",
      statusBarLyricConfig ?? {}
    );
  }

  refreshLyric();
}

const LyricManager = {
  setup,
  useLyricState: lyricStateStore.useValue,
  getLyricState: lyricStateStore.getValue,
  useCurrentLyric: currentLyricStore.useValue,
  getCurrentLyric: currentLyricStore.getValue,
  setCurrentLyric: currentLyricStore.setValue,
  updateCurrentLyricForPosition,
  refreshLyric,
  setLyricLoading: refreshLyric
};

export default LyricManager;

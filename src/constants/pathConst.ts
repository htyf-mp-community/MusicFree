import {Platform} from 'react-native';
import * as RNFS from '@dr.pogodin/react-native-fs';

export const basePath =
    Platform.OS === 'android'
        ? RNFS.ExternalDirectoryPath
        : RNFS.DocumentDirectoryPath;

export default {
    basePath,
    pluginPath: `${basePath}/plugins/`,
    logPath: `${basePath}/log/`,
    dataPath: `${basePath}/data/`,
    cachePath: `${basePath}/cache/`,
    musicCachePath: RNFS.CachesDirectoryPath + '/TrackPlayer',
    imageCachePath: RNFS.CachesDirectoryPath + '/image_manager_disk_cache',
    lrcCachePath: `${basePath}/cache/lrc/`,
    downloadPath: `${basePath}/download/`,
    downloadMusicPath: `${basePath}/download/music/`,
    mmkvPath: `${basePath}/mmkv`,
    mmkvCachePath: `${basePath}/cache/mmkv`,
};

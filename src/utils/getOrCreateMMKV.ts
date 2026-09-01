import pathConst from '@/constants/pathConst';
import {createMMKV, MMKV} from 'react-native-mmkv';

const _mmkvCache: Record<string, MMKV> = {};

/** HTYF appid 前缀，确保同一宿主中的应用不会共享 MMKV 命名空间。 */
export const MMKV_APP_NAMESPACE = 'plugin_music';

/** Returns the stable application-owned MMKV id for a logical database name. */
export const getNamespacedMMKVId = (dbName: string): string =>
    `${MMKV_APP_NAMESPACE}.${dbName}`;

// @ts-ignore;
global.mmkv = _mmkvCache;

// Internal Method
const getOrCreateMMKV = (dbName: string, cachePath = false) => {
    const namespacedId = getNamespacedMMKVId(dbName);
    if (_mmkvCache[namespacedId]) {
        return _mmkvCache[namespacedId];
    }

    const newStore = createMMKV({
        id: namespacedId,
        path: cachePath ? pathConst.mmkvCachePath : pathConst.mmkvPath,
    });

    _mmkvCache[namespacedId] = newStore;
    return newStore;
};

export default getOrCreateMMKV;

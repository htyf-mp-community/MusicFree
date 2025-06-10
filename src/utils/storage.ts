import {errorLog} from '@/utils/log';
import ReactNativeBlobUtil from 'react-native-blob-util'
import { MultiGetCallback } from '@react-native-async-storage/async-storage/lib/typescript/types';
import { MMKV } from 'react-native-mmkv';
const AsyncStorage = new MMKV({
    id: 'musicfree',
    path: `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/musicfree`,
    encryptionKey: `musicfree`
});
export async function setStorage(key: string, value: any) {
    try {
        await AsyncStorage.set(key, JSON.stringify(value, null, ''));
    } catch (e: any) {
        errorLog(`存储失败${key}`, e?.message);
    }
}

export async function getStorage(key: string) {
    try {
        const result = await AsyncStorage.getString(key);
        if (result) {
            return JSON.parse(result);
        }
    } catch {}
    return null;
}

export async function getMultiStorage(keys: string[]) {
    if (keys.length === 0) {
        return [];
    }
    const multiGet = (keys: readonly string[], callback?: MultiGetCallback) => {
    const values = keys.map((key) => AsyncStorage.getString(key))
    if (callback && typeof callback === 'function') {
        callback(undefined, values as any);
    }
    return values;
    }
    const result = await multiGet(keys);

    return result.map(_ => {
        try {
            if (_[1]) {
                return JSON.parse(_[1]);
            }
            return null;
        } catch {
            return null;
        }
    });
}

export async function removeStorage(key: string) {
    return AsyncStorage.delete(key);
}

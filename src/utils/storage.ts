import {errorLog} from '@/utils/log';
import getOrCreateMMKV from '@/utils/getOrCreateMMKV';

/** 应用旧版键值数据使用的独立 MMKV 命名空间。 */
const legacyStore = getOrCreateMMKV('Legacy');

/** 保存可 JSON 序列化的数据；异步签名用于兼容原项目调用方。 */
export async function setStorage(key: string, value: unknown): Promise<void> {
    try {
        legacyStore.set(key, JSON.stringify(value));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        errorLog(`存储失败${key}`, message);
    }
}

/** 读取并反序列化一个应用键；缺失或损坏时返回 null。 */
export async function getStorage<T = any>(key: string): Promise<T | null> {
    try {
        const result = legacyStore.getString(key);
        return result === undefined ? null : (JSON.parse(result) as T);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        errorLog(`读取存储失败${key}`, message);
        return null;
    }
}

/** 按输入顺序批量读取；缺失或损坏的项目为 null。 */
export async function getMultiStorage<T = any>(
    keys: readonly string[],
): Promise<Array<T | null>> {
    return Promise.all(keys.map(key => getStorage<T>(key)));
}

/** 删除一个应用键。 */
export async function removeStorage(key: string): Promise<void> {
    legacyStore.remove(key);
}

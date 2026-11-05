/**
 * 将任务延后到 JS 空闲时执行；宿主未提供 idle API 时让出当前事件循环。
 * 返回的 Promise 等待任务及其异步结果完成，并向调用方传递异常。
 * 空闲回调设置 100ms 超时，避免繁忙界面一直推迟歌单写入或下载任务。
 */
export default function runWhenIdle<T>(task: () => T | PromiseLike<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        const execute = () => {
            try {
                resolve(task());
            } catch (error) {
                reject(error);
            }
        };

        if (typeof globalThis.requestIdleCallback === 'function') {
            globalThis.requestIdleCallback(execute, {timeout: 100});
        } else {
            setTimeout(execute, 0);
        }
    });
}

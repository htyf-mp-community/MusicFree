import runWhenIdle from '../src/utils/runWhenIdle';

const originalIdleCallback = Object.getOwnPropertyDescriptor(
    globalThis,
    'requestIdleCallback',
);

describe('idle task scheduling in the HTYF host', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        Object.defineProperty(globalThis, 'requestIdleCallback', {
            configurable: true,
            writable: true,
            value: undefined,
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        if (originalIdleCallback) {
            Object.defineProperty(globalThis, 'requestIdleCallback', originalIdleCallback);
        } else {
            Reflect.deleteProperty(globalThis, 'requestIdleCallback');
        }
    });

    test('yields before running when the host has no idle callback API', async () => {
        const task = jest.fn(() => 42);
        const result = runWhenIdle(task);

        expect(task).not.toHaveBeenCalled();
        await jest.runAllTimersAsync();

        await expect(result).resolves.toBe(42);
        expect(task).toHaveBeenCalledTimes(1);
    });

    test('uses an idle deadline without running the task immediately', async () => {
        const callbacks: Array<() => void> = [];
        const requestIdle = jest.fn((callback: () => void) => {
            callbacks.push(callback);
            return 1;
        });
        Object.defineProperty(globalThis, 'requestIdleCallback', {value: requestIdle});
        const task = jest.fn(() => 'saved');
        const result = runWhenIdle(task);

        expect(requestIdle).toHaveBeenCalledWith(expect.any(Function), {timeout: 100});
        expect(task).not.toHaveBeenCalled();
        callbacks[0]?.();

        await expect(result).resolves.toBe('saved');
    });

    test('waits for an asynchronous task to finish', async () => {
        let finish: ((value: number) => void) | undefined;
        const task = jest.fn(() => new Promise<number>(resolve => {
            finish = resolve;
        }));
        const settled = jest.fn();
        const result = runWhenIdle(task).then(value => {
            settled(value);
            return value;
        });

        await jest.runAllTimersAsync();
        expect(task).toHaveBeenCalledTimes(1);
        expect(settled).not.toHaveBeenCalled();
        finish?.(42);

        await expect(result).resolves.toBe(42);
    });

    test('propagates synchronous errors and asynchronous rejections', async () => {
        const error = new Error('storage failed');
        for (const task of [() => {throw error;}, () => Promise.reject(error)]) {
            await Promise.all([
                expect(runWhenIdle(task)).rejects.toBe(error),
                jest.runAllTimersAsync(),
            ]);
        }
    });
});

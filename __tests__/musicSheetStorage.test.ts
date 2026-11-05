jest.mock('react-native', () => ({}));
jest.mock('../src/utils/getOrCreateMMKV', () => ({
    __esModule: true,
    default: () => mockDatabase,
}));

import storage from '../src/core/musicSheet/storage';

const mockData = new Map<string, string>();
const mockDatabase = {
    set: jest.fn((key: string, value: string) => mockData.set(key, value)),
    getString: (key: string) => mockData.get(key),
};

describe('music sheet persistence without InteractionManager', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockData.clear();
        mockDatabase.set.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('persists the startup sheet list before the write promise resolves', async () => {
        const sheets = [{id: 'startup-sheet', title: 'My music'}];
        await Promise.all([
            expect(storage.setSheets(sheets)).resolves.toBeUndefined(),
            jest.runAllTimersAsync(),
        ]);

        expect(mockDatabase.set).toHaveBeenCalledWith('data', JSON.stringify(sheets));
        expect(storage.getSheets()).toEqual(sheets);
    });
});

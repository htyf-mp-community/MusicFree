jest.mock('@dr.pogodin/react-native-fs', () => ({
    ExternalDirectoryPath: '/external',
    DocumentDirectoryPath: '/documents',
    CachesDirectoryPath: '/cache',
}));

jest.mock('react-native-mmkv', () => ({
    createMMKV: jest.fn(({id}) => ({id})),
}));

import {createMMKV} from 'react-native-mmkv';
import getOrCreateMMKV, {
    getNamespacedMMKVId,
    MMKV_APP_NAMESPACE,
} from '../src/utils/getOrCreateMMKV';

describe('MMKV namespace isolation', () => {
    test('prefixes every logical database with the HTYF app id', () => {
        expect(MMKV_APP_NAMESPACE).toBe('plugin_music');
        expect(getNamespacedMMKVId('App.config')).toBe('plugin_music.App.config');
    });

    test('reuses an instance for the same logical database', () => {
        const first = getOrCreateMMKV('test.persistence');
        const second = getOrCreateMMKV('test.persistence');
        expect(first).toBe(second);
        expect(createMMKV).toHaveBeenCalledTimes(1);
        expect(createMMKV).toHaveBeenCalledWith(
            expect.objectContaining({id: 'plugin_music.test.persistence'}),
        );
    });
});

import {syncLyricAtPosition} from '../src/core/lyricProgress';

describe('lyric playback progress synchronization', () => {
    const lyrics = [
        {index: 0, time: 0, lrc: 'same line'},
        {index: 1, time: 5, lrc: 'same line'},
        {index: 2, time: 10, lrc: 'next line'},
    ];
    const parser = {
        getPosition: (position: number) =>
            [...lyrics].reverse().find(item => item.time <= position),
    };

    test('updates the index when playback crosses into identical lyric text', () => {
        const setCurrent = jest.fn();
        const result = syncLyricAtPosition(6, parser, lyrics[0], setCurrent);

        expect(result?.index).toBe(1);
        expect(setCurrent).toHaveBeenCalledWith(lyrics[1]);
    });

    test('does not publish duplicate state for the same lyric index', () => {
        const setCurrent = jest.fn();
        syncLyricAtPosition(6, parser, lyrics[1], setCurrent);
        expect(setCurrent).not.toHaveBeenCalled();
    });

    test('resolves the lyric shown at 01:47 playback progress', () => {
        const timedParser = {
            getPosition: (position: number) =>
                [
                    {index: 0, time: 0, lrc: 'credits'},
                    {index: 1, time: 60, lrc: 'first verse'},
                    {index: 2, time: 105, lrc: 'current at 01:47'},
                ]
                    .reverse()
                    .find(item => item.time <= position),
        };
        const setCurrent = jest.fn();

        const result = syncLyricAtPosition(107, timedParser, null, setCurrent);

        expect(result).toEqual({index: 2, time: 105, lrc: 'current at 01:47'});
        expect(setCurrent).toHaveBeenCalledWith(result);
    });
});

import {
    capsuleRightPadding,
    capsuleOccupiedRightInset,
    normalizeCapsuleRect,
    verticallyIntersects,
} from '../src/utils/capsuleLayout';

describe('HTYF capsule layout', () => {
    const window = {width: 390, height: 844};

    test('keeps logical-point coordinates unchanged', () => {
        expect(
            normalizeCapsuleRect(
                {left: 280, top: 12, right: 372, bottom: 44},
                window,
                3,
            ),
        ).toEqual({left: 280, top: 12, right: 372, bottom: 44, width: 92, height: 32});
    });

    test('normalizes physical pixels on a 3x display', () => {
        expect(
            normalizeCapsuleRect(
                {left: 840, top: 36, right: 1116, bottom: 132},
                window,
                3,
            ),
        ).toEqual({left: 280, top: 12, right: 372, bottom: 44, width: 92, height: 32});
    });

    test('supports hosts that return x/y/width/height instead of edges', () => {
        expect(
            normalizeCapsuleRect(
                {x: 280, y: 12, width: 92, height: 32},
                window,
                3,
            ),
        ).toEqual({left: 280, top: 12, right: 372, bottom: 44, width: 92, height: 32});
    });

    test.each([null, undefined, {}, {left: 10, top: 10, right: 5, bottom: 20}])(
        'rejects missing or invalid geometry: %p',
        raw => {
            expect(normalizeCapsuleRect(raw, window, 3)).toBeNull();
        },
    );

    test('rejects a malformed capsule reported in the left half of the window', () => {
        expect(
            normalizeCapsuleRect(
                {x: 0, y: 12, width: 92, height: 32},
                window,
                3,
            ),
        ).toBeNull();
    });

    test('reserves a safety gap only for vertically overlapping controls', () => {
        const capsule = normalizeCapsuleRect(
            {left: 280, top: 12, right: 372, bottom: 44},
            window,
            3,
        );
        expect(capsuleRightPadding(window.width, {top: 0, bottom: 56}, capsule)).toBe(120);
        expect(capsuleRightPadding(window.width, {top: 44, bottom: 100}, capsule)).toBe(0);
        expect(verticallyIntersects({top: 44, bottom: 100}, capsule!)).toBe(false);
    });

    test('recalculates against a changed window width', () => {
        const capsule = normalizeCapsuleRect(
            {left: 700, top: 24, right: 820, bottom: 72},
            {width: 844, height: 390},
            2,
        );
        expect(capsuleRightPadding(844, {top: 0, bottom: 88}, capsule)).toBe(154);
    });

    test('reserves only the capsule occupied area in the toolbar row', () => {
        expect(
            capsuleOccupiedRightInset(
                {left: 280, top: 12, right: 372, bottom: 44, width: 92, height: 32},
                390,
                3,
            ),
        ).toBe(120);
    });

    test('normalizes physical-pixel capsule width and right edge', () => {
        expect(
            capsuleOccupiedRightInset({width: 276, right: 1116}, 390, 3),
        ).toBe(120);
    });

});

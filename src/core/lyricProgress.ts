import {IParsedLrcItem} from '@/utils/lrcParser';

interface LyricPositionParser {
    getPosition(position: number): IParsedLrcItem | null | undefined;
}

/**
 * Resolves and publishes the lyric for a playback position.
 *
 * Index comparison is intentional: two consecutive timestamped lines may have
 * identical text but must still advance the highlight and list position.
 */
export function syncLyricAtPosition(
    positionSeconds: number,
    parser: LyricPositionParser,
    previous: IParsedLrcItem | null | undefined,
    publish: (item: IParsedLrcItem | null) => void,
): IParsedLrcItem | null {
    const current = parser.getPosition(positionSeconds) ?? null;
    if (previous?.index !== current?.index) {
        publish(current);
    }
    return current;
}

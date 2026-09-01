/** A rectangle expressed in React Native logical points. */
export interface LogicalRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

/** Some HTYF hosts expose React Native x/y fields in addition to SDK edges. */
export interface RawCapsuleRect extends Partial<LogicalRect> {
    x?: number;
    y?: number;
}

/**
 * Returns the toolbar's right inset so its right edge stays before the capsule.
 * Width/right are sufficient when a host reports x/y in another coordinate space.
 */
export function capsuleOccupiedRightInset(
    raw: RawCapsuleRect | null | undefined,
    windowWidth: number,
    pixelRatio: number,
    safetyGap = 10,
): number {
    if (!raw || !isFinitePositive(windowWidth) || !isFinitePositive(pixelRatio)) {
        return 0;
    }
    const rawWidth = isFinitePositive(raw.width)
        ? raw.width
        : isFinitePositive(raw.right) && isFiniteNonNegative(raw.left)
          ? raw.right - raw.left
          : 0;
    if (!isFinitePositive(rawWidth)) {
        return 0;
    }
    const width = rawWidth <= windowWidth / 2 ? rawWidth : rawWidth / pixelRatio;
    const right = isFinitePositive(raw.right)
        ? raw.right <= windowWidth
            ? raw.right
            : raw.right / pixelRatio
        : windowWidth;
    const trailingSpace = right <= windowWidth ? windowWidth - right : 0;
    return Math.min(windowWidth / 2, width + trailingSpace + safetyGap);
}

export interface LogicalSize {
    width: number;
    height: number;
}

const isFinitePositive = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;
const isFiniteNonNegative = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0;

/**
 * Normalizes an HTYF capsule rectangle to logical points.
 * Coordinates that only fit the window after division are treated as physical pixels.
 */
export function normalizeCapsuleRect(
    raw: RawCapsuleRect | null | undefined,
    window: LogicalSize,
    pixelRatio: number,
): LogicalRect | null {
    if (
        !raw ||
        !isFinitePositive(window.width) ||
        !isFinitePositive(window.height) ||
        !isFinitePositive(pixelRatio)
    ) {
        return null;
    }

    const rawLeft = isFiniteNonNegative(raw.left) && raw.left !== 0 ? raw.left : raw.x ?? raw.left;
    const rawTop = isFiniteNonNegative(raw.top) && raw.top !== 0 ? raw.top : raw.y ?? raw.top;
    const rawRight =
        isFinitePositive(raw.right) && raw.right > (rawLeft ?? 0)
            ? raw.right
            : typeof rawLeft === 'number' && isFinitePositive(raw.width)
              ? rawLeft + raw.width
              : undefined;
    const rawBottom =
        isFinitePositive(raw.bottom) && raw.bottom > (rawTop ?? 0)
            ? raw.bottom
            : typeof rawTop === 'number' && isFinitePositive(raw.height)
              ? rawTop + raw.height
              : undefined;
    const values = [rawLeft, rawTop, rawRight, rawBottom];
    if (!values.every(value => typeof value === 'number' && Number.isFinite(value))) {
        return null;
    }

    const source = {
        left: rawLeft!,
        top: rawTop!,
        right: rawRight!,
        bottom: rawBottom!,
    };
    const fitsLogical = source.right <= window.width && source.bottom <= window.height;
    const scale = fitsLogical ? 1 : pixelRatio;
    const left = Math.max(0, source.left / scale);
    const top = Math.max(0, source.top / scale);
    const right = Math.min(window.width, source.right / scale);
    const bottom = Math.min(window.height, source.bottom / scale);

    if (
        right <= left ||
        bottom <= top ||
        right > window.width ||
        bottom > window.height ||
        left < window.width / 2
    ) {
        return null;
    }

    return {left, top, right, bottom, width: right - left, height: bottom - top};
}

/** Returns whether two vertical ranges overlap. Touching edges do not overlap. */
export function verticallyIntersects(
    first: Pick<LogicalRect, 'top' | 'bottom'>,
    second: Pick<LogicalRect, 'top' | 'bottom'>,
): boolean {
    return first.top < second.bottom && first.bottom > second.top;
}

/**
 * Calculates the right padding needed to keep a header element left of the capsule.
 * Content outside the capsule's vertical range regains the full window width.
 */
export function capsuleRightPadding(
    windowWidth: number,
    element: Pick<LogicalRect, 'top' | 'bottom'>,
    capsule: LogicalRect | null,
    safetyGap = 10,
): number {
    if (!capsule || !verticallyIntersects(element, capsule)) {
        return 0;
    }
    return Math.max(0, windowWidth - capsule.left + safetyGap);
}

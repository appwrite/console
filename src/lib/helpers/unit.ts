import { derived, writable } from 'svelte/store';
import { last } from './array';
import { withPrevious } from './withPrevious';

export type Unit<T = string> = {
    name: T;
    value: number;
};

/**
 * Creates a value-unit pair. When the unit is changed, the value is updated
 * to reflect the new unit.
 *
 * @export
 * @template T = string
 * @param {number} [initialValue=0]
 * @param {Unit<T>[]} units
 */
export function createValueUnitPair<T = string>(initialValue = 0, units: Unit<T>[]) {
    if (!units.some((u) => u.value === 1)) {
        throw new Error('Units must have a value of 1');
    }

    if (units.some((u) => u.value < 1)) {
        throw new Error('Units must have a value greater than 1');
    }

    // Highest to lowest
    const sortedUnits = units.sort((a, b) => b.value - a.value);

    const unit = withPrevious(last(sortedUnits).name);
    const value = writable(initialValue);
    const baseValue = derived([value, unit], ([$value, $unit]) => {
        return $value * units.find((u) => u.name === $unit).value;
    });

    for (const u of sortedUnits) {
        if (initialValue >= u.value && initialValue % u.value === 0) {
            unit.set(u.name, { updateAll: true });
            value.set(initialValue / u.value);
            break;
        }
    }

    unit.subscribe((newValue, prev) => {
        value.update((v) => {
            const prevUnit = units.find((u) => u.name === prev);
            const newUnit = units.find((u) => u.name === newValue);

            // If either unit is not found, just return the current value
            if (!prevUnit || !newUnit) {
                return v;
            }

            const unitInBase = v * prevUnit.value;
            return unitInBase / newUnit.value;
        });
    });
    return {
        value,
        unit,
        baseValue
    };
}

export function createTimeUnitPair(initialValue = 0) {
    const units: Unit[] = [
        { name: 'Days', value: 86400 },
        { name: 'Hours', value: 3600 },
        { name: 'Minutes', value: 60 },
        { name: 'Seconds', value: 1 }
    ];
    return { ...createValueUnitPair(initialValue, units), units };
}

export function createByteUnitPair(initialValue = 0) {
    const units: Unit[] = [
        { name: 'Bytes', value: 1 },
        { name: 'Kilobytes', value: 1024 },
        { name: 'Megabytes', value: 1024 ** 2 },
        { name: 'Gigabytes', value: 1024 ** 3 }
    ];
    return { ...createValueUnitPair(initialValue, units), units };
}

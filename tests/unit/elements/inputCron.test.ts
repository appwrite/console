import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { InputCron } from '../../../src/lib/elements/forms';

const validStrings = [
    '*/2 */2 * * *',
    '* * * * *',
    '* 20,21,22 * * *',
    // Handles CSV values
    '* 20,22 * * *',
    // CSV values can be complex
    '7-9 * */9 * *',
    // 15th minute, of the second hour, every 15 days, in January, every Friday
    '1 * * * 7',
    // Test with exact times
    '47 21 * * *',
    // Test Day of the week
    // According cron implementation, 0|7 = sunday, 1 => monday, etc
    '* * * * 0',
    '* * * * 7',
    '* * * * 1',
    // Should return the sunday date as 7 equals 0
    '0 0 * * MON,SUN',
    '0 0 * * 1,7',
    '0 0 * * 0-4',
    '0 0 * * 7-4',
    '0 0 * * 4-7',
    '0 0 * * 7-3',
    '0 0 * * 3-7',
    '0 0 * * 3-7',
    // Test lists of values and ranges (Abhoryo)
    '0 0 * * 2-7',
    '0 0 * * 2-7',
    '0 0 * * 4-7',
    // Test increments of ranges
    '0-12/4 * * * *',
    '4-59/2 * * * *',
    '4-59/2 * * * *',
    '4-59/3 * * * *',
    // Test Day of the Week and the Day of the Month
    '0 0 1 1 0',
    '0 0 1 JAN 0',
    '0 0 1 * 0',
    // Test the W day of the week modifier for day of the month field
    '0 0 2W * *',
    '0 0 1W * *',
    '0 0 1W * *',
    '0 0 3W * *',
    '0 0 16W * *',
    '0 0 28W * *',
    '0 0 30W * *',
    '0 0 31W * *',
    // Test the last weekday of a month
    '* * * * 5L',
    '* * * * 6L',
    '* * * * 7L',
    '* * * * 1L',
    '* * * 1 5L',
    // Test the hash symbol for the nth weekday of a given month
    '* * * * 5#2',
    '* * * * 5#1',
    '* * * * 3#4',
    // make sure that casing is less relevant for shortcuts, months, and days
    '0 1 15 JUL mon,Wed,FRi',
    '0 1 15 jul mon,Wed,FRi',
    //DOW and DOM do not support ?
    '0 12 * * ?',
    '0 12 ? * *',
    '0-59/59 10 * * *',
    '0-59/59 10 * * *',
    '0-59/59 10 * * *',
    '0-59/65 10 * * *',
    '41-59/24 5 * * *'
];
const invalidStrings = ['invalid', '*', '* *', '* * *', '* * * *'];

test('shows id input', () => {
    const { getByPlaceholderText } = render(InputCron, { label: 'Cron', id: 'cron' });
    const input = getByPlaceholderText('* * * * *');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
});

test('state', async () => {
    const { component, getByPlaceholderText } = render(InputCron, {
        value: '',
        label: 'Cron',
        id: 'cron'
    });
    const input = getByPlaceholderText('* * * * *');

    expect(component.value).toEqual('');
    await userEvent.type(input, 'lorem');
    expect(component.value).toEqual('lorem');
});

validStrings.forEach((validString) => {
    test(`validates ${validString} as valid`, () => {
        const { getByPlaceholderText } = render(InputCron, {
            value: validString,
            label: 'Cron',
            id: 'cron'
        });
        const input = getByPlaceholderText('* * * * *') as HTMLInputElement;
        expect(input.checkValidity()).toBe(true);
    });
});

invalidStrings.forEach((invalidString) => {
    test(`validates ${invalidString} as invalid`, () => {
        const { getByPlaceholderText } = render(InputCron, {
            value: invalidString,
            label: 'Cron',
            id: 'cron'
        });
        const input = getByPlaceholderText('* * * * *') as HTMLInputElement;
        expect(input.checkValidity()).toBe(false);
    });
});

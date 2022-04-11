import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import { SwitchBox } from '../../../src/lib/components';
const src = 'https://via.placeholder.com/50';

test('shows boolean input', () => {
    const { getByText, getByRole, getByAltText } = render(SwitchBox, {
        id: 'input',
        src,
        label: 'Bool',
        alt: 'image'
    });
    const checkbox = getByRole('switch');
    const img = getByAltText('image');

    expect(getByText('Bool')).toBeInTheDocument();
    expect(img).toBeInTheDocument();
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('type', 'checkbox');
});

test('shows boolean input - required', () => {
    const { getByRole } = render(SwitchBox, { id: 'input', src, label: 'Bool', required: true });

    expect(getByRole('switch')).toBeRequired();
});

test('shows boolean input - disabled', () => {
    const { getByRole } = render(SwitchBox, { id: 'input', src, label: 'Bool', disabled: true });

    expect(getByRole('switch')).toBeDisabled();
});

test('state', async () => {
    const { getByRole, component } = render(SwitchBox, { id: 'input', src, label: 'Bool' });
    const checkbox = getByRole('switch');

    expect(checkbox).not.toBeChecked();
    expect(component.value).toStrictEqual(false);

    await fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(component.value).toStrictEqual(true);

    await fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(component.value).toStrictEqual(false);

    component.value = true;
    expect(checkbox).toBeChecked();
    expect(component.value).toStrictEqual(true);

    component.value = false;
    expect(checkbox).not.toBeChecked();
    expect(component.value).toStrictEqual(false);
});

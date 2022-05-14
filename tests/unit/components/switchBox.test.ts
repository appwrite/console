import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/svelte';
import { SwitchBox } from '../../../src/lib/components';

const box = {
    id: 'input',
    src: 'https://via.placeholder.com/50',
    label: 'Bool',
    alt: 'image',
    required: false,
    disabled: false,
    value: false
};

test('shows boolean input', () => {
    const { getByText, getByRole, getByAltText } = render(SwitchBox, {
        box
    });
    const checkbox = getByRole('switch');
    const img = getByAltText('image');

    expect(getByText('Bool')).toBeInTheDocument();
    expect(img).toBeInTheDocument();
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('type', 'checkbox');
});

test('shows boolean input - required', () => {
    box.required = true;
    const { getByRole } = render(SwitchBox, { box });

    expect(getByRole('switch')).toBeRequired();
});

test('shows boolean input - disabled', () => {
    box.disabled = true;
    const { getByRole } = render(SwitchBox, { box });

    expect(getByRole('switch')).toBeDisabled();
});

test('state', async () => {
    const { getByRole, component } = render(SwitchBox, { box });
    const checkbox = getByRole('switch');

    setTimeout(() => {
        expect(checkbox).not.toBeChecked();
        expect(component.box.value).toStrictEqual(false);
    }, 1);

    await fireEvent.click(checkbox);
    setTimeout(() => {
        expect(checkbox).toBeChecked();
        expect(component.box.value).toStrictEqual(true);
    }, 1);

    await fireEvent.click(checkbox);
    setTimeout(() => {
        expect(checkbox).not.toBeChecked();
        expect(component.box.value).toStrictEqual(false);
    }, 1);

    component.box.value = true;
    setTimeout(() => {
        expect(checkbox).toBeChecked();
        expect(component.box.value).toStrictEqual(true);
    }, 1);

    component.box.value = false;
    setTimeout(() => {
        expect(checkbox).not.toBeChecked();
        expect(component.box.value).toStrictEqual(false);
    }, 1);
});

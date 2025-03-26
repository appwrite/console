import { expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, fireEvent } from '@testing-library/svelte';
import { InputTags } from '../../../src/lib/elements/forms';

test('shows label', () => {
    const { getByText } = render(InputTags, { id: 'input', label: 'Tags' });

    expect(getByText('Tags')).toBeInTheDocument();
});

test('shows input - autofocus', () => {
    const { getByLabelText } = render(InputTags, { id: 'input', label: 'Tags' });

    expect(getByLabelText('Tags')).toHaveFocus();
});

test('shows input - hide label', () => {
    render(InputTags, {
        id: 'input',
        label: 'label'
    });

    const label = document.querySelector('label');
    expect(label).toHaveClass('u-hide');
});

test('shows tags', () => {
    const { getByText } = render(InputTags, {
        id: 'input',
        label: 'Tags',
        tags: ['first', 'second']
    });

    expect(getByText('first')).toBeInTheDocument();
    expect(getByText('second')).toBeInTheDocument();
});

test('adds and removes tags by input', async () => {
    const { component, getByLabelText } = render(InputTags, { id: 'input', label: 'Tags' });
    const input = getByLabelText('Tags');

    // Add tag by enter
    await userEvent.type(input, 'first{enter}');
    expect(component.tags).toHaveLength(1);
    expect(component.tags).toContain('first');

    // Add tag by space
    await userEvent.type(input, 'second ');
    expect(component.tags).toHaveLength(2);
    expect(component.tags).toContain('second');

    // Remove tag by backspace
    await userEvent.type(input, '{backspace}');
    expect(component.tags).toContain('first');
    expect(component.tags).not.toContain('second');
    expect(component.tags).toHaveLength(1);

    // Remove tag by delete
    await userEvent.type(input, '{delete}');
    expect(component.tags).not.toContain('first');
    expect(component.tags).toHaveLength(0);
});

test('removes tag on click', async () => {
    const { component, getByText, queryByText } = render(InputTags, {
        id: 'input',
        label: 'Tags',
        tags: ['first', 'second']
    });

    expect(component.tags).toHaveLength(2);
    expect(component.tags).toContain('first');
    expect(component.tags).toContain('second');
    const first = getByText('first').nextElementSibling;

    await fireEvent.click(first);
    expect(component.tags).toHaveLength(1);
    expect(component.tags).toContain('second');
    expect(component.tags).not.toContain('first');
    expect(queryByText('first')).not.toBeInTheDocument();

    const second = getByText('second').nextElementSibling;
    await fireEvent.click(second);
    expect(component.tags).toHaveLength(0);
    expect(component.tags).not.toContain('second');
    expect(component.tags).not.toContain('first');
    expect(queryByText('second')).not.toBeInTheDocument();
});

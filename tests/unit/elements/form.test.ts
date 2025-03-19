import { expect, test } from 'vitest';
import { vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { Form } from '../../../src/lib/elements/forms';
import { sleep } from '$lib/helpers/promises';
import CompleteForm from '../../../src/lib/mock/form.test.svelte';
import { tick } from 'svelte';

test('shows form', () => {
    const { container } = render(Form, {
        onSubmit: vi.fn()
    });
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('form');
    expect(form).toHaveClass('common-section');
    expect(form).not.toHaveClass('modal-form');
});

test('shows form - no margin', () => {
    const { container } = render(Form, {
        onSubmit: vi.fn()
    });
    const form = container.querySelector('form');
    expect(form).toHaveClass('form');
    expect(form).not.toHaveClass('common-section');
    expect(form).not.toHaveClass('modal-form');
});

test('shows form - no style', () => {
    const { container } = render(Form, {
        noStyle: true,
        onSubmit: vi.fn()
    });
    const form = container.querySelector('form');
    expect(form).toHaveClass('common-section');
    expect(form).not.toHaveClass('form');
    expect(form).not.toHaveClass('modal-form');
});

test('shows form - is modal', () => {
    const { container } = render(Form, {
        isModal: true,
        onSubmit: vi.fn()
    });
    const form = container.querySelector('form');
    expect(form).toHaveClass('form');
    expect(form).toHaveClass('common-section');
    expect(form).toHaveClass('modal-form');
});

test('shows form - submitting', async () => {
    const callback = vi.fn();
    const { container } = render(Form, {
        onSubmit: callback
    });
    const form = container.querySelector('form');
    form.requestSubmit();
    expect(callback.mock.calls.length).toBe(1);
});

test('shows form - submitting promise', async () => {
    const callback = vi.fn();
    const { container } = render(Form, {
        onSubmit: async () => {
            await sleep(100);
            callback();
        }
    });
    const form = container.querySelector('form');
    form.requestSubmit();
    expect(callback.mock.calls.length).toBe(0);
    await sleep(200);
    expect(callback.mock.calls.length).toBe(1);
});

test('shows form - prevent double submit', async () => {
    const { container } = render(CompleteForm, {
        onSubmit: async () => {
            await sleep(100);
        }
    });
    const form = container.querySelector('form');
    const submit = container.querySelector('button[type="submit"]');
    const button = container.querySelector('button[type="button"]');
    expect(submit).toBeEnabled();
    expect(button).toBeEnabled();
    form.requestSubmit();
    await tick();
    expect(submit).toBeDisabled();
    expect(button).toBeEnabled();
    await sleep(200);
    expect(submit).toBeEnabled();
    expect(button).toBeEnabled();
});

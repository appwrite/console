import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, fireEvent } from '@testing-library/svelte';
import Modal from './modal.test.svelte';

test('shows modal', async () => {
    const { queryByText, component } = render(Modal);

    expect(queryByText('Content')).not.toBeInTheDocument();

    component.show = true;
    await new Promise((r) => setTimeout(r, 200));
    expect(queryByText('Content')).toBeInTheDocument();

    component.show = false;
    await new Promise((r) => setTimeout(r, 200));
    expect(queryByText('Content')).not.toBeInTheDocument();
});

test('close modal by click', async () => {
    const { queryByText, component, getByTitle } = render(Modal, {
        show: true
    });
    await new Promise((r) => setTimeout(r, 200));

    expect(queryByText('Content')).toBeInTheDocument();

    await fireEvent.click(getByTitle('Close Modal'));

    await new Promise((r) => setTimeout(r, 200));
    expect(queryByText('Content')).not.toBeInTheDocument();
    expect(component.show).toStrictEqual(false);
});

test('close modal by key', async () => {
    const { queryByText, component } = render(Modal, {
        show: true
    });

    await new Promise((r) => setTimeout(r, 200));
    expect(queryByText('Content')).toBeInTheDocument();

    await userEvent.keyboard('[Escape]');
    await new Promise((r) => setTimeout(r, 200));
    expect(queryByText('Content')).not.toBeInTheDocument();
    expect(component.show).toStrictEqual(false);
});

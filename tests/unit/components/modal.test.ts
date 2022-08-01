import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import Modal from '../../../src/lib/mock/modal.test.svelte';

afterEach(() => cleanup());

test('hides modal', async () => {
    const { queryByText } = render(Modal);

    expect(queryByText('Content')).not.toBeInTheDocument();
});

test('shows modal', async () => {
    const { queryByText } = render(Modal, {
        show: true
    });

    expect(queryByText('Content')).toBeInTheDocument();
});

test('close modal by click', async () => {
    const { queryByText, component, getByTitle } = render(Modal, {
        show: true
    });

    expect(queryByText('Content')).toBeInTheDocument();
    await fireEvent.click(getByTitle('Close Modal'));
    expect(component.show).toStrictEqual(false);
});

test('close modal by key', async () => {
    const { queryByText, component } = render(Modal, {
        show: true
    });

    expect(queryByText('Content')).toBeInTheDocument();
    await userEvent.keyboard('[Escape]');
    expect(component.show).toStrictEqual(false);
});

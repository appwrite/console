import '@testing-library/jest-dom';
import { render, cleanup } from '@testing-library/svelte';
import Modal from '../../../src/lib/mock/modal.test.svelte';

afterEach(() => cleanup());

test('renders modal', async () => {
    const { container } = render(Modal);

    expect(container.querySelector('dialog')).toBeInTheDocument();
});

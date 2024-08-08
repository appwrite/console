import { render } from '@testing-library/svelte';
import Modal from '../../../src/lib/mock/modal.test.svelte';
import { expect, test } from 'vitest';

test('renders modal', async () => {
    const { container } = render(Modal);

    expect(container.querySelector('dialog')).toBeInTheDocument();
});

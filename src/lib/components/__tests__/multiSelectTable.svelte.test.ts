import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import Harness from './multiSelectTableHarness.svelte';
import { navigateTo } from './appState.svelte';

vi.mock('$app/state', () => import('./appState.svelte'));

vi.mock('$lib/stores/sdk', () => ({
    sdk: {
        forConsole: { account: { getPrefs: () => Promise.resolve({}) } },
        forProject: () => ({})
    }
}));

vi.mock('$lib/actions/analytics', () => ({
    trackEvent: vi.fn(),
    trackError: vi.fn(),
    Click: {},
    Submit: {}
}));

const pages = { '1': ['a', 'b', 'c'], '2': ['d', 'e', 'f'] };

async function goToPageTwo() {
    navigateTo('?page=2');
    await tick();
}

describe('MultiSelectionTable', () => {
    beforeEach(() => navigateTo('?page=1'));

    it('drops the selection when another page of rows is loaded', async () => {
        const user = userEvent.setup();
        render(Harness, { props: { pages, onDeleteIds: vi.fn() } });

        const [, firstRow] = screen.getAllByRole('checkbox');
        await user.click(firstRow);
        expect(screen.getByText('file selected')).toBeInTheDocument();

        await goToPageTwo();

        expect(screen.queryByText('file selected')).not.toBeInTheDocument();
    });

    it('selects only the rows on screen after paginating', async () => {
        const user = userEvent.setup();
        const onDeleteIds = vi.fn();
        render(Harness, { props: { pages, onDeleteIds } });

        await goToPageTwo();

        const [selectAll] = screen.getAllByRole('checkbox');
        await user.click(selectAll);
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(onDeleteIds).toHaveBeenCalledWith(['d', 'e', 'f']);
    });
});

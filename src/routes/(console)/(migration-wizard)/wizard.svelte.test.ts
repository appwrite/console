import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import { sdk } from '$lib/stores/sdk';
import { wizard } from '$lib/stores/wizard';
import { formData, provider, selectedProject, selectedRegion } from '.';
import { goto, invalidate } from '$app/navigation';
import { addNotification } from '$lib/stores/notifications';
import { Dependencies } from '$lib/constants';
import { get } from 'svelte/store';
import { Region } from '@appwrite.io/console';
import MigrationWizard from './wizard.svelte';

const api = vi.hoisted(() => ({
    listProjects: vi.fn(),
    createProject: vi.fn(),
    deleteProject: vi.fn(),
    createMigration: vi.fn()
}));

vi.mock('$lib/commandCenter', async () => {
    const { readable } = await import('svelte/store');
    return { disableCommands: readable(vi.fn()) };
});
vi.mock('$lib/actions/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('$lib/stores/sdk', () => ({
    sdk: {
        forConsole: { organization: vi.fn(() => api) },
        forProject: vi.fn(() => ({
            project: { delete: api.deleteProject },
            migrations: { createAppwriteMigration: api.createMigration }
        }))
    }
}));
vi.mock('$app/state', () => ({
    page: { data: { organizations: { teams: [{ $id: 'team', name: 'My team' }] } } }
}));
vi.mock('$app/navigation', () => ({ goto: vi.fn(), invalidate: vi.fn() }));
vi.mock('$lib/stores/notifications', () => ({ addNotification: vi.fn() }));
vi.mock('$lib/stores/organization', async () => {
    const { writable } = await import('svelte/store');
    return { regions: writable({ regions: [] }) };
});
vi.mock('$routes/store', async () => {
    const { writable } = await import('svelte/store');
    return { requestedMigration: writable(null) };
});
vi.mock('$lib/layout', async () => ({
    Wizard: (await import('$lib/layout/wizard.svelte')).default
}));
vi.mock('$lib/components', async () => ({
    EyebrowHeading: (await import('$lib/components/eyebrowHeading.svelte')).default
}));
vi.mock('$lib/elements/forms', async () => ({
    InputText: (await import('$lib/elements/forms/inputText.svelte')).default,
    InputSelect: (await import('$lib/elements/forms/inputSelect.svelte')).default,
    Button: (await import('$lib/elements/forms/button.svelte')).default
}));
vi.mock('./resource-form.svelte', async () => ({
    default: (await import('./resource-form.fixture.svelte')).default
}));

const created = { $id: 'destination', name: 'Imported project', region: 'fra' };

async function next() {
    await fireEvent.input(await screen.findByLabelText('Project name'), {
        target: { value: 'Imported project' }
    });
    await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('button', { name: 'Update' });
}

async function cancel() {
    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await fireEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', {
            name: 'Exit'
        })
    );
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => {
        resolve = done;
    });
    return { promise, resolve };
}

async function selectResources() {
    await act(() => formData.update((data) => ({ ...data, users: { root: true, teams: false } })));
}

describe('migration destination cancellation', () => {
    beforeAll(() => {
        vi.stubGlobal(
            'IntersectionObserver',
            class {
                observe() {}
                disconnect() {}
                unobserve() {}
            }
        );
        Object.defineProperties(HTMLDialogElement.prototype, {
            showModal: {
                configurable: true,
                value() {
                    this.open = true;
                }
            },
            close: {
                configurable: true,
                value() {
                    this.open = false;
                }
            }
        });
    });

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(sdk.forConsole.organization).mockReturnValue(api as never);
        vi.mocked(sdk.forProject).mockReturnValue({
            project: { delete: api.deleteProject },
            migrations: { createAppwriteMigration: api.createMigration }
        } as never);
        api.listProjects.mockResolvedValue({ projects: [] });
        api.createProject.mockResolvedValue(created);
        api.deleteProject.mockResolvedValue({});
        api.createMigration.mockResolvedValue({});
        selectedProject.set(null);
        selectedRegion.set(Region.Fra);
        formData.reset();
        provider.set({
            provider: 'appwrite',
            endpoint: 'https://source.example/v1',
            projectID: 'source',
            apiKey: 'test-key'
        });
        vi.spyOn(wizard, 'hide');
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('deletes the destination created by this wizard when cancellation is confirmed', async () => {
        render(MigrationWizard);
        await next();
        await cancel();

        await waitFor(() => expect(api.deleteProject).toHaveBeenCalledOnce());
        expect(sdk.forProject).toHaveBeenLastCalledWith('fra', 'destination');
        expect(wizard.hide).toHaveBeenCalledOnce();
    });

    it('leaves a selected existing project untouched', async () => {
        api.listProjects.mockResolvedValue({ projects: [{ ...created, $id: 'existing' }] });
        render(MigrationWizard);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled());
        await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await screen.findByRole('button', { name: 'Update' });
        await cancel();
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.createProject).not.toHaveBeenCalled();
        expect(api.deleteProject).not.toHaveBeenCalled();
    });

    it('keeps the new project when exit confirmation is dismissed', async () => {
        render(MigrationWizard);
        await next();
        await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        await fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' })
        );
        expect(api.deleteProject).not.toHaveBeenCalled();
        expect(wizard.hide).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Update' })).toBeVisible();
        await cancel();
        await waitFor(() => expect(api.deleteProject).toHaveBeenCalledOnce());
    });

    it('exits before project creation without deleting anything', async () => {
        render(MigrationWizard);
        await screen.findByLabelText('Project name');
        await cancel();
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.createProject).not.toHaveBeenCalled();
        expect(api.deleteProject).not.toHaveBeenCalled();
    });

    it('reuses the same project after Update and Next', async () => {
        render(MigrationWizard);
        await next();
        await fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await screen.findByRole('button', { name: 'Update' });
        expect(api.createProject).toHaveBeenCalledOnce();
        expect(api.deleteProject).not.toHaveBeenCalled();
    });

});

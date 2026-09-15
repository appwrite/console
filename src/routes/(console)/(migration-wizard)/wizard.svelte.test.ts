import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import { sdk } from '$lib/stores/sdk';
import { wizard } from '$lib/stores/wizard';
import { formData, provider, selectedProject, selectedRegion } from '.';
import { beforeNavigate, goto, invalidate } from '$app/navigation';
import type { BeforeNavigate } from '@sveltejs/kit';
import Shell from '$lib/layout/shell.svelte';
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
        forConsole: {
            organization: vi.fn(() => api),
            avatars: { getInitials: () => new URL('http://localhost/avatar') }
        },
        forProject: vi.fn(() => ({
            project: { delete: api.deleteProject },
            migrations: { createAppwriteMigration: api.createMigration }
        }))
    }
}));
vi.mock('$app/state', () => ({
    page: {
        params: {},
        url: new URL('http://localhost/console/organization-current'),
        data: { organizations: { teams: [{ $id: 'team', name: 'My team' }] } }
    }
}));
vi.mock('$app/navigation', () => ({
    goto: vi.fn(),
    invalidate: vi.fn(),
    beforeNavigate: vi.fn(),
    afterNavigate: vi.fn()
}));
vi.mock('$app/stores', async () => {
    const { readable } = await import('svelte/store');
    return { page: readable({ data: {} }) };
});
vi.mock('$lib/helpers/sidebar', () => ({
    getSidebarState: () => 'closed',
    isInDatabasesRoute: () => false,
    updateSidebarState: vi.fn()
}));
vi.mock('$lib/helpers/project', () => ({ isProjectBlocked: () => false }));
vi.mock('$lib/layout/navigation.svelte', () => ({ default: () => {} }));
vi.mock('$lib/components/impersonation/banner.svelte', () => ({ default: () => {} }));
vi.mock('$lib/stores/notifications', () => ({ addNotification: vi.fn() }));
vi.mock('$lib/stores/organization', async () => {
    const { writable } = await import('svelte/store');
    return {
        regions: writable({ regions: [] }),
        organization: writable(null),
        organizationList: writable({ teams: [] })
    };
});
vi.mock('$routes/store', async () => {
    const { writable } = await import('svelte/store');
    return { requestedMigration: writable(null) };
});
vi.mock('$lib/layout', async () => ({
    Wizard: (await import('$lib/layout/wizard.svelte')).default
}));
vi.mock('$lib/components', async () => ({
    EyebrowHeading: (await import('$lib/components/eyebrowHeading.svelte')).default,
    Navbar: () => {},
    Sidebar: () => {}
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

function renderWithShell() {
    wizard.start(MigrationWizard);
    render(Shell, { showHeader: false, showFooter: false });
    const component = render(MigrationWizard);
    const before = vi.mocked(beforeNavigate).mock.calls.at(-1)[0];
    return { component, before };
}

async function navigate(
    before: (navigation: BeforeNavigate) => void,
    path: string,
    type: 'link' | 'popstate' | 'goto' = 'link'
) {
    const cancel = vi.fn();
    const navigation = {
        type,
        from: {
            url: new URL('http://localhost/console/organization-current'),
            route: { id: '/(console)/organization-[organization]' },
            params: {},
            scroll: null
        },
        to: {
            url: new URL(path, 'http://localhost'),
            route: { id: '/(console)/organization-[organization]' },
            params: {},
            scroll: null
        },
        willUnload: false,
        complete: Promise.resolve(),
        cancel,
        ...(type === 'popstate'
            ? { delta: -1, event: new PopStateEvent('popstate') }
            : type === 'link'
              ? { event: new MouseEvent('click') as PointerEvent }
              : {})
    } as BeforeNavigate;
    await act(() => before(navigation));
    return cancel;
}

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
        vi.stubGlobal('scrollTo', vi.fn());
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
        wizard.hide();
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

    it('deletes the previous unused project before creating one with changed settings', async () => {
        render(MigrationWizard);
        await next();
        await fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        await fireEvent.input(screen.getByLabelText('Project name'), {
            target: { value: 'Replacement' }
        });
        api.createProject.mockResolvedValue({
            ...created,
            $id: 'replacement',
            name: 'Replacement'
        });
        await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await screen.findByRole('button', { name: 'Update' });
        expect(api.deleteProject).toHaveBeenCalledOnce();
        expect(api.createProject).toHaveBeenCalledTimes(2);
        expect(api.deleteProject.mock.invocationCallOrder[0]).toBeLessThan(
            api.createProject.mock.invocationCallOrder[1]
        );
        expect(api.createProject).toHaveBeenLastCalledWith(
            expect.objectContaining({ name: 'Replacement' })
        );
        expect(invalidate).toHaveBeenCalledWith(Dependencies.PROJECTS);
    });

    it('uses the created project region and ID even if the selected region changes', async () => {
        api.createProject.mockResolvedValue({ ...created, region: 'syd' });
        render(MigrationWizard);
        await next();
        await act(() => selectedRegion.set(Region.Fra));
        await cancel();
        await waitFor(() => expect(api.deleteProject).toHaveBeenCalledOnce());
        expect(sdk.forProject).toHaveBeenLastCalledWith('syd', 'destination');
        expect(api.createProject).toHaveBeenCalledWith(
            expect.objectContaining({ region: Region.Fra })
        );
    });

    it('reports creation failure and exits without issuing a delete', async () => {
        api.createProject.mockRejectedValue(new Error('Creation failed'));
        render(MigrationWizard);
        await fireEvent.input(await screen.findByLabelText('Project name'), {
            target: { value: 'Imported project' }
        });
        await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
                type: 'error',
                message: 'Creation failed'
            })
        );
        expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
        await cancel();
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.deleteProject).not.toHaveBeenCalled();
    });

    it('keeps ownership after a failed deletion so cancellation can retry', async () => {
        api.deleteProject.mockRejectedValueOnce(new Error('Deletion failed'));
        render(MigrationWizard);
        await next();
        await cancel();
        await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
                type: 'error',
                message: 'Deletion failed'
            })
        );
        expect(wizard.hide).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Update' })).toBeVisible();
        await cancel();
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.deleteProject).toHaveBeenCalledTimes(2);
    });

    it('does not create a replacement while cleanup of the previous destination fails', async () => {
        render(MigrationWizard);
        await next();
        api.deleteProject.mockRejectedValue(new Error('Deletion failed'));
        await fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        await fireEvent.input(screen.getByLabelText('Project name'), {
            target: { value: 'Replacement' }
        });
        await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
                type: 'error',
                message: 'Deletion failed'
            })
        );
        expect(api.createProject).toHaveBeenCalledOnce();
        expect(screen.getByLabelText('Project name')).toHaveValue('Replacement');
    });

    it('finishes cancellation when the new project was already deleted', async () => {
        api.deleteProject.mockRejectedValue({ code: 404, message: 'Project not found' });
        render(MigrationWizard);
        await next();
        await cancel();
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(invalidate).toHaveBeenCalledWith(Dependencies.PROJECTS);
        expect(addNotification).not.toHaveBeenCalled();
    });

    it('waits for deletion to finish before hiding the wizard', async () => {
        const deletion = deferred<object>();
        api.deleteProject.mockReturnValue(deletion.promise);
        render(MigrationWizard);
        await next();
        await cancel();
        expect(wizard.hide).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        await act(() => deletion.resolve({}));
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.deleteProject).toHaveBeenCalledOnce();
    });

    it('waits for an in-flight creation and deletes its result after confirmed exit', async () => {
        const creation = deferred<typeof created>();
        api.createProject.mockReturnValue(creation.promise);
        render(MigrationWizard);
        await fireEvent.input(await screen.findByLabelText('Project name'), {
            target: { value: 'Imported project' }
        });
        await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await waitFor(() => expect(api.createProject).toHaveBeenCalledOnce());
        await cancel();
        expect(api.deleteProject).not.toHaveBeenCalled();
        expect(wizard.hide).not.toHaveBeenCalled();
        await act(() => creation.resolve(created));
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.deleteProject).toHaveBeenCalledOnce();
        expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
    });

    it('does not submit a second project creation while Next is pending', async () => {
        const creation = deferred<typeof created>();
        api.createProject.mockReturnValue(creation.promise);
        render(MigrationWizard);
        await fireEvent.input(await screen.findByLabelText('Project name'), {
            target: { value: 'Imported project' }
        });
        const button = screen.getByRole('button', { name: 'Next' });
        await fireEvent.click(button);
        await fireEvent.click(button);
        expect(api.createProject).toHaveBeenCalledOnce();
        await act(() => creation.resolve(created));
        await screen.findByRole('button', { name: 'Update' });
    });

    it('keeps the project after a migration request fails because importing may have started', async () => {
        api.createMigration.mockRejectedValue(new Error('Connection lost'));
        render(MigrationWizard);
        await next();
        await selectResources();
        await fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
                type: 'error',
                message: 'Connection lost'
            })
        );
        await cancel();
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.deleteProject).not.toHaveBeenCalled();
    });

    it('keeps a successfully submitted destination and navigates to its migrations', async () => {
        render(MigrationWizard);
        await next();
        await selectResources();
        await fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() =>
            expect(goto).toHaveBeenCalledWith(
                expect.stringContaining('/project-fra-destination/settings/migrations')
            )
        );
        expect(api.createMigration).toHaveBeenCalledWith(
            expect.objectContaining({ projectId: 'source', endpoint: 'https://source.example/v1' })
        );
        expect(api.deleteProject).not.toHaveBeenCalled();
        expect(invalidate).toHaveBeenCalledWith(Dependencies.PROJECTS);
        expect(get(formData).users.root).toBe(false);
        expect(get(selectedProject)).toBeNull();
    });

    it('prevents exit while the migration request is still in flight', async () => {
        const migration = deferred<object>();
        api.createMigration.mockReturnValue(migration.promise);
        render(MigrationWizard);
        await next();
        await selectResources();
        await fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
        await fireEvent.keyDown(window, { key: 'Escape' });
        await fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Exit' })
        );
        expect(wizard.hide).not.toHaveBeenCalled();
        expect(api.deleteProject).not.toHaveBeenCalled();
        await act(() => migration.resolve({}));
        await waitFor(() => expect(goto).toHaveBeenCalled());
    });

    it('deletes the new destination when Escape exit is confirmed', async () => {
        render(MigrationWizard);
        await next();
        await fireEvent.keyDown(window, { key: 'Escape' });
        await fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Exit' })
        );
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.deleteProject).toHaveBeenCalledOnce();
    });

    it('finishes using an existing project after releasing the wizard-created destination', async () => {
        api.listProjects.mockResolvedValue({
            projects: [{ ...created, $id: 'existing', name: 'Existing destination', region: 'syd' }]
        });
        render(MigrationWizard);
        await fireEvent.click(await screen.findByRole('radio', { name: /Create new project/ }));
        await next();
        await fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        await fireEvent.click(screen.getByRole('radio', { name: /Existing project/ }));
        await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await screen.findByRole('button', { name: 'Update' });
        expect(api.deleteProject).toHaveBeenCalledOnce();
        await selectResources();
        await fireEvent.click(screen.getByRole('button', { name: 'Create' }));
        await waitFor(() =>
            expect(goto).toHaveBeenCalledWith(
                expect.stringContaining('/project-syd-existing/settings/migrations')
            )
        );
        expect(api.deleteProject).toHaveBeenCalledOnce();
        expect(get(selectedProject)).toBeNull();
    });

    it('displays the prepared project name when creation returns after the input changes', async () => {
        const creation = deferred<typeof created>();
        api.createProject.mockReturnValue(creation.promise);
        render(MigrationWizard);
        const input = await screen.findByLabelText('Project name');
        await fireEvent.input(input, { target: { value: 'Imported project' } });
        await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        await fireEvent.input(input, { target: { value: 'Changed while creating' } });
        await act(() => creation.resolve(created));
        await screen.findByRole('button', { name: 'Update' });
        expect(screen.getByText('Imported project')).toBeVisible();
        expect(screen.queryByText('Changed while creating')).not.toBeInTheDocument();
    });

    it('cleans up when browser Back requests and confirms exit', async () => {
        const { before } = renderWithShell();
        await next();
        const cancellation = await navigate(before, '/organization-previous', 'popstate');
        expect(cancellation).toHaveBeenCalledOnce();
        await fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Exit' })
        );
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(api.deleteProject).toHaveBeenCalledOnce();
        expect(goto).not.toHaveBeenCalled();
    });

    it('resumes an internal link only after confirmed cleanup succeeds', async () => {
        const deletion = deferred<object>();
        api.deleteProject.mockReturnValue(deletion.promise);
        const { before } = renderWithShell();
        await next();
        expect(await navigate(before, '/organization-next')).toHaveBeenCalledOnce();
        await fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Exit' })
        );
        expect(goto).not.toHaveBeenCalled();
        expect(wizard.hide).not.toHaveBeenCalled();
        await act(() => deletion.resolve({}));
        await waitFor(() =>
            expect(goto).toHaveBeenCalledWith('http://localhost/organization-next')
        );
        expect(api.deleteProject).toHaveBeenCalledOnce();
        expect(
            await navigate(before, 'http://localhost/organization-next', 'goto')
        ).not.toHaveBeenCalled();
    });

    it('forgets a dismissed navigation request before a later Cancel exit', async () => {
        const { before } = renderWithShell();
        await next();
        expect(await navigate(before, '/organization-next')).toHaveBeenCalledOnce();
        await fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' })
        );
        expect(api.deleteProject).not.toHaveBeenCalled();
        await cancel();
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(goto).not.toHaveBeenCalled();
    });

    it('stays on the current page after navigation cleanup fails', async () => {
        api.deleteProject.mockRejectedValueOnce(new Error('Deletion failed'));
        const { before } = renderWithShell();
        await next();
        expect(await navigate(before, '/organization-next')).toHaveBeenCalledOnce();
        await fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Exit' })
        );
        await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
                type: 'error',
                message: 'Deletion failed'
            })
        );
        expect(goto).not.toHaveBeenCalled();
        expect(wizard.hide).not.toHaveBeenCalled();
        await cancel();
        await waitFor(() => expect(wizard.hide).toHaveBeenCalledOnce());
        expect(goto).not.toHaveBeenCalled();
    });

    it('ignores another navigation request while confirmed cleanup is pending', async () => {
        const deletion = deferred<object>();
        api.deleteProject.mockReturnValue(deletion.promise);
        const { before } = renderWithShell();
        await next();
        expect(await navigate(before, '/organization-first')).toHaveBeenCalledOnce();
        await fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', { name: 'Exit' })
        );
        expect(await navigate(before, '/organization-second')).toHaveBeenCalledOnce();
        await act(() => deletion.resolve({}));
        await waitFor(() =>
            expect(goto).toHaveBeenCalledWith('http://localhost/organization-first')
        );
        expect(goto).toHaveBeenCalledOnce();
        expect(api.deleteProject).toHaveBeenCalledOnce();
    });

    it('clears the owned navigation handler when the wizard is unmounted', async () => {
        const { component, before } = renderWithShell();
        await screen.findByLabelText('Project name');
        component.unmount();

        expect(await navigate(before, '/organization-next')).not.toHaveBeenCalled();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(api.deleteProject).not.toHaveBeenCalled();
    });
});

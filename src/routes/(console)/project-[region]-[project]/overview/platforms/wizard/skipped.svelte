<script context="module" lang="ts">
    import { createPlatform } from './store';
    import { wizard } from '$lib/stores/wizard';
    import { writable } from 'svelte/store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const showSkippedModal = writable(false);

    async function closeWizard() {
        wizard.hide();
        createPlatform.reset();
    }

    /**
     * Previously, data was updated after the wizard was closed,
     * this sometimes caused outdated data to be visible for a brief moment.
     */
    export async function invalidateDependencies(): Promise<void> {
        await Promise.all([invalidate(Dependencies.PROJECT), invalidate(Dependencies.PLATFORMS)]);
    }

    export async function onPlatformSetupFinish(event: CustomEvent): Promise<void> {
        const type = event.type;
        const skipped = event.detail?.skipped ?? false;
        const optional = event.detail?.optional ?? false;

        const isSkipped = type === 'finish' ? skipped : type === 'exit' ? optional : false;

        showSkippedModal.set(isSkipped);

        if (!isSkipped) {
            await closeWizard();
        }
    }
</script>

<script lang="ts">
    import { page } from '$app/state';
    import { CopyInput, Modal } from '$lib/components';
    import { Button, FormList } from '$lib/elements/forms';
    import { getProjectEndpoint } from '$lib/helpers/project';

    const project = page.params.project;
</script>

<Modal
    closable={false}
    closeByEscape={false}
    headerDivider={false}
    onSubmit={closeWizard}
    bind:show={$showSkippedModal}
    title="Skipping optional steps">
    <FormList>
        <p>
            The platform will be added to your project. Access Appwrite services using this
            project's API Endpoint and Project ID:
        </p>

        <CopyInput label="API Endpoint" showLabel={true} value={getProjectEndpoint()} />
        <CopyInput label="Project ID" showLabel={true} value={project} />
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => ($showSkippedModal = false)}>Cancel</Button>
        <Button submit>Go to dashboard</Button>
    </svelte:fragment>
</Modal>

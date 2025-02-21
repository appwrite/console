<script context="module" lang="ts">
    import { createPlatform } from './store';
    import { wizard } from '$lib/stores/wizard';
    import { get, writable } from 'svelte/store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const showSkippedModal = writable(false);
    const skippedModalOnSubmit = () => wizard.hide();

    export async function onPlatformSetupFinish(event: CustomEvent): Promise<void> {
        showSkippedModal.set(event.detail?.skipped ?? false);

        createPlatform.reset();
        await Promise.all([invalidate(Dependencies.PROJECT), invalidate(Dependencies.PLATFORMS)]);

        if (!get(showSkippedModal)) {
            wizard.hide();
        }
    }
</script>

<script lang="ts">
    import { page } from '$app/stores';
    import { CopyInput, Modal } from '$lib/components';
    import { Button, FormList } from '$lib/elements/forms';
    import { getProjectEndpoint } from '$lib/helpers/project';

    const project = $page.params.project;
    $: {
        console.log($showSkippedModal);
    }
</script>

<div style:background="deeppink">
    <Modal
        headerDivider={false}
        bind:show={$showSkippedModal}
        onSubmit={skippedModalOnSubmit}
        title="Skipping optional steps">
        <FormList>
            <p>
                The platform will be added to your project. Use the Project ID and API endpoint in
                your project to get started:
            </p>

            <CopyInput label="Project ID" showLabel={true} value={project} />
            <CopyInput label="Endpoint" showLabel={true} value={getProjectEndpoint()} />
        </FormList>

        <svelte:fragment slot="footer">
            <Button text on:click={() => ($showSkippedModal = false)}>Cancel</Button>
            <Button submit>Go to dashboard</Button>
        </svelte:fragment>
    </Modal>
</div>
<script lang="ts">
    import {
        InputChoice,
        Button,
        InputFile,
        FormList,
        InputTextarea,
        InputText
    } from '$lib/elements/forms';
    import { Collapsible, CollapsibleItem, Modal } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let show = false;

    let active = false;
    let files: FileList;
    let entrypoint: string = null;
    let buildCommand: string = null;
    let error: string = null;

    const functionId = $page.params.function;
    const dispatch = createEventDispatcher();

    async function create() {
        try {
            await sdk.forProject.functions.createDeployment(functionId, files[0], active);
            await invalidate(Dependencies.DEPLOYMENTS);
            files = undefined;
            active = false;
            show = false;
            dispatch('created');
            trackEvent(Submit.DeploymentCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DeploymentCreate);
        }
    }

    $: if (!show) {
        files = undefined;
        active = false;
        error = null;
    }
</script>

<Modal {error} size="big" bind:show onSubmit={create}>
    <svelte:fragment slot="header">Create Deployment</svelte:fragment>
    <FormList>
        <InputFile
            label="Gzipped code (tar.gz)"
            allowedFileExtensions={['gz']}
            bind:files
            required={true} />
        <InputText
            label="Entrypoint"
            id="entrypoint"
            placeholder="Entrypoint"
            bind:value={entrypoint}
            required />
        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">Build commands</svelte:fragment>
                <svelte:fragment slot="subtitle">(optional)</svelte:fragment>
                <FormList>
                    <InputTextarea
                        label="Commands"
                        placeholder="Enter a build commad (e.g. 'npm run build')"
                        id="build"
                        bind:value={buildCommand} />
                </FormList>
            </CollapsibleItem>
        </Collapsible>
        <InputChoice label="Activate deployment after build" id="activate" bind:value={active}>
            This deployment will be activated after the build is completed.</InputChoice>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>

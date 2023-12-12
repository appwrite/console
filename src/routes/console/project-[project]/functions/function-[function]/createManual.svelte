<script lang="ts">
    import { InputChoice, Button, InputFile, FormList, InputText } from '$lib/elements/forms';
    import { Alert, Collapsible, CollapsibleItem, Modal } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { func } from './store';

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
            await sdk.forProject.functions.createDeployment(
                functionId,
                files[0],
                active,
                entrypoint || undefined,
                buildCommand || undefined
            );
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

<Modal
    title="Create manual deployment"
    {error}
    size="big"
    bind:show
    onSubmit={create}
    headerDivider={false}>
    <p class="text">
        Manually deploy a function by uploading a zip file containing the source code and a relative
        path to the entry point.
        <a
            href="https://appwrite.io/docs/products/functions/deployment"
            target="_blank"
            rel="noopener noreferrer"
            class="link">Learn more about function deployments</a
        >.
    </p>
    <FormList gap={16}>
        <InputFile
            label="Gzipped code (tar.gz)"
            allowedFileExtensions={['gz']}
            bind:files
            required={true} />
        <InputText
            label="Entrypoint"
            id="entrypoint"
            placeholder="Entrypoint"
            bind:value={entrypoint} />
        {#if $func.version !== 'v3'}
            <Alert type="info">
                <svelte:fragment slot="title">
                    Build commands now available for functions v3.0
                </svelte:fragment>
                Update your function version to make use of new features including build commands.
                <svelte:fragment slot="buttons">
                    <Button
                        href="https://appwrite.io/docs/products/functions/development"
                        external
                        text>Learn more</Button>
                </svelte:fragment>
            </Alert>
        {:else}
            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Build settings</svelte:fragment>
                    <svelte:fragment slot="subtitle">(optional)</svelte:fragment>
                    <FormList gap={16}>
                        <p class="text">
                            Overwrite your function configuration for a single deployment or save
                            commands for future use.
                        </p>
                        <InputText
                            label="Commands"
                            placeholder="Enter a build commad (e.g. 'npm install')"
                            tooltip="Enter a single command or chain multiple commands with the && operator"
                            id="build"
                            bind:value={buildCommand} />
                    </FormList>
                </CollapsibleItem>
            </Collapsible>
        {/if}
        <InputChoice label="Activate deployment after build" id="activate" bind:value={active}>
            This deployment will be activated after the build is completed.
        </InputChoice>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>

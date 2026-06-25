<script lang="ts">
    import { Button, InputText } from '$lib/elements/forms';
    import { Fieldset, Layout, Selector } from '@appwrite.io/pink-svelte';
    import SelectRootModal from './selectRootModal.svelte';
    import BranchSelector from './branchSelector.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';

    export let branch = 'main';
    export let rootDir: string;
    export let silentMode: boolean;
    export let installationId: string;
    export let repositoryId: string;
    export let product: 'sites' | 'functions';

    let show = false;

    async function loadDefaultBranch() {
        const repo = await sdk
            .forProject(page.params.region, page.params.project)
            .vcs.getRepository({
                installationId,
                providerRepositoryId: repositoryId
            });
        branch = repo.defaultBranch ?? 'main';
    }
</script>

<Fieldset legend="Branch">
    {#await loadDefaultBranch()}
        <Layout.Stack gap="xl">
            <Layout.Stack gap="xs" />
        </Layout.Stack>
    {:then}
        <Layout.Stack gap="xl">
            <BranchSelector
                bind:value={branch}
                {installationId}
                {repositoryId}
                on:select={(e) => (branch = e.detail)} />
            <Layout.Stack direction="row" gap="s" alignItems="flex-end">
                <InputText
                    id="root"
                    label="Root directory"
                    placeholder="Select directory"
                    bind:value={rootDir} />
                <Button secondary size="s" on:click={() => (show = true)}>Select</Button>
            </Layout.Stack>

            <Selector.Checkbox
                size="s"
                id="silentMode"
                label="Silent mode"
                description="If selected, comments will not be created when pushing changes to this repository."
                bind:checked={silentMode} />
        </Layout.Stack>
    {/await}
</Fieldset>

{#if show}
    <SelectRootModal bind:show bind:rootDir {product} {branch} />
{/if}

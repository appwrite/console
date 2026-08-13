<script lang="ts">
    import { Button, InputText } from '$lib/elements/forms';
    import { Alert, Fieldset, Layout, Selector } from '@appwrite.io/pink-svelte';
    import SelectRootModal from './selectRootModal.svelte';
    import BranchSelector from './branchSelector.svelte';
    import InstallationError from './installationError.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { getVcsInstallationErrorKind } from '$lib/helpers/vcsError';
    import { installation, installations } from '$lib/stores/vcs';

    type Props = {
        branch?: string;
        rootDir: string;
        silentMode: boolean;
        installationId: string;
        repositoryId: string;
        product: 'sites' | 'functions';
    };

    let {
        branch = $bindable('main'),
        rootDir = $bindable(),
        silentMode = $bindable(),
        installationId,
        repositoryId,
        product
    }: Props = $props();

    let show = $state(false);
    let loading = $state(true);
    /**
     * The last failure from the default branch lookup. Without it the fieldset
     * rendered nothing at all when the installation token was dead, because the
     * `{#await}` this replaced had no `{:catch}`.
     */
    let error = $state<unknown>(null);

    const errorKind = $derived(getVcsInstallationErrorKind(error));

    /**
     * Provider and owner for the reconnect alert. Every route that renders this
     * fieldset loads `page.data.installations`; the writable store covers the
     * surfaces that pick an installation client side.
     */
    const installationDetails = $derived(
        $installations?.installations?.find((entry) => entry.$id === installationId) ??
            ($installation?.$id === installationId ? $installation : undefined)
    );

    async function loadDefaultBranch() {
        loading = true;
        error = null;
        try {
            const repo = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.getRepository({
                    installationId,
                    providerRepositoryId: repositoryId
                });
            branch = repo.defaultBranch ?? 'main';
        } catch (e) {
            // The default branch is unknown, but the rest of the form still has
            // to work. Keep whatever the parent seeded so the user can pick or
            // type a branch instead of being left with an empty fieldset.
            error = e;
            branch = branch || 'main';
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        // Re-detects whenever the target repository changes, which is what the
        // `{#await loadDefaultBranch()}` this replaced did implicitly.
        if (!installationId || !repositoryId) {
            loading = false;
            return;
        }
        loadDefaultBranch();
    });
</script>

<Fieldset legend="Branch">
    {#if loading}
        <Layout.Stack gap="xl">
            <Layout.Stack gap="xs" />
        </Layout.Stack>
    {:else}
        <Layout.Stack gap="xl">
            {#if errorKind}
                <InstallationError
                    kind={errorKind}
                    provider={installationDetails?.provider}
                    organization={installationDetails?.organization}
                    onRetry={loadDefaultBranch} />
            {:else if error}
                <Alert.Inline status="warning" title="Could not detect the default branch">
                    Appwrite could not read this repository, so the branch below is a fallback
                    rather than the repository's own default. Check it before you deploy.
                    <svelte:fragment slot="actions">
                        <Button compact on:click={loadDefaultBranch}>Try again</Button>
                    </svelte:fragment>
                </Alert.Inline>
            {/if}

            <BranchSelector
                bind:value={branch}
                {installationId}
                {repositoryId}
                showInstallationError={!errorKind} />
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
    {/if}
</Fieldset>

{#if show}
    <SelectRootModal bind:show bind:rootDir {product} {branch} />
{/if}

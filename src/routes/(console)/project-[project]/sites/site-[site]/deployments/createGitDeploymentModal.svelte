<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal, Card } from '$lib/components';
    import { Repositories } from '$lib/components/git';
    import { Dependencies } from '$lib/constants';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import InputSelectSearch from '$lib/elements/forms/inputSelectSearch.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository, sortBranches } from '$lib/stores/vcs';
    import type { BuildRuntime, Framework, Models } from '@appwrite.io/console';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Icon, InlineCode, Layout, Spinner, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let show = false;
    export let site: Models.Site;

    let installations = { installations: [], total: 0 };
    let hasRepository = !!site?.providerRepositoryId;
    let selectedRepository: string = null;
    let branch: string = null;
    let error = '';

    onMount(async () => {
        installations = await sdk.forProject.vcs.listInstallations();
        if (!site?.installationId && installations.total > 0) {
            installation.set(installations.installations[0]);
        }
        if (!$repository?.id && hasRepository) {
            $repository = await sdk.forProject.vcs.getRepository(
                $installation.$id,
                site.providerRepositoryId
            );
        }
        console.log(installations);
    });

    async function loadBranches() {
        const { branches } = await sdk.forProject.vcs.listRepositoryBranches(
            $installation.$id,
            selectedRepository
        );
        const sorted = sortBranches(branches);
        branch = sorted[0]?.name ?? null;

        if (!branch) {
            branch = 'main';
        }

        return sorted;
    }

    async function createDeployment() {
        try {
            if (!site.installationId || !site.providerRepositoryId || !branch) {
                await sdk.forProject.sites.update(
                    site.$id,
                    site.name,
                    site?.framework as Framework,
                    site.enabled || undefined,
                    site.timeout || undefined,
                    site.installCommand || undefined,
                    site.buildCommand || undefined,
                    site.outputDirectory || undefined,
                    (site?.buildRuntime as BuildRuntime) || undefined,
                    site.adapter || undefined,
                    site.fallbackFile || undefined,
                    site.installationId || $installation.$id || undefined,
                    site.providerRepositoryId || $repository.id || undefined,
                    branch,
                    site.providerSilentMode || undefined,
                    undefined //TODO: add dir?
                );
            }
            show = false;
            invalidate(Dependencies.DEPLOYMENTS);
            addNotification({
                message: 'Deployment has been created successfully',
                type: 'success'
            });
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal title="Create Git deployment" bind:show onSubmit={createDeployment} bind:error>
    <span slot="description">
        Enter a valid commit reference to create a new deployment from <InlineCode code="test" /> or
        use the CLI to deploy. <Link href="#">Learn more</Link>
    </span>
    {#if installations && hasRepository}
        <Card isTile padding="s" radius="s">
            <Layout.Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap="xs">
                <Layout.Stack direction="row" alignItems="center" gap="s">
                    <Icon size="s" icon={IconGithub} />
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-primary">
                        {$repository?.organization}/{$repository?.name}
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
        </Card>
        {#await loadBranches()}
            <Spinner size="s" />
        {:then branches}
            {@const options =
                branches
                    ?.map((branch) => {
                        return {
                            value: branch.name,
                            label: branch.name
                        };
                    })
                    ?.sort((a, b) => {
                        return a.label > b.label ? 1 : -1;
                    }) ?? []}

            <InputSelectSearch
                required={true}
                id="branch"
                label="Production branch"
                placeholder="Select branch"
                hideRequired
                bind:value={branch}
                bind:search={branch}
                on:select={(event) => {
                    branch = event.detail.value;
                }}
                interactiveOutput
                name="branch"
                {options} />
        {/await}
    {/if}
    {#if !hasRepository}
        <Repositories
            bind:selectedRepository
            installationList={installations}
            product="sites"
            action="button"
            callbackState={{
                createDeployment: 'true'
            }}
            on:connect={(e) => {
                repository.set(e.detail);
                hasRepository = true;
            }} />
    {/if}
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" disabled={!$installation?.$id || !selectedRepository || !branch}
            >Create</Button>
    </svelte:fragment>
</Modal>

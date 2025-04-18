<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal, Card } from '$lib/components';
    import { Repositories } from '$lib/components/git';
    import { Dependencies } from '$lib/constants';
    import { Link } from '$lib/elements';
    import { Button, InputCheckbox, InputSelect } from '$lib/elements/forms';
    import { timeFromNow } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository, sortBranches } from '$lib/stores/vcs';
    import {
        Adapter,
        BuildRuntime,
        Framework,
        VCSDeploymentType,
        type Models
    } from '@appwrite.io/console';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Skeleton, Typography } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let site: Models.Site;

    export let installations: Models.InstallationList;
    let hasRepository = !!site?.providerRepositoryId;
    let selectedRepository: string = site.providerRepositoryId;
    let branch: string = null;
    let commit: string = null;
    let activate = true;
    let error = '';

    async function loadInstallations() {
        if (!site?.installationId && installations?.total > 0) {
            installation.set(installations.installations[0]);
        }
        $installation = installations.installations.find(
            (installation) => installation.$id === site.installationId
        );
        if (!$installation?.$id) {
            $installation = installations.installations[0];
        }
    }

    async function load() {
        try {
            await loadInstallations();
            if (!$repository?.id && hasRepository) {
                $repository = await sdk.forProject.vcs.getRepository(
                    $installation.$id,
                    site.providerRepositoryId
                );
            }
            selectedRepository = $repository?.id;
            const branchList = await sdk.forProject.vcs.listRepositoryBranches(
                $installation.$id,
                selectedRepository
            );

            const sorted = sortBranches(branchList.branches);
            branch = sorted[0]?.name ?? null;

            if (!branch) {
                branch = 'main';
            }

            return sorted;
        } catch (error) {
            console.log(installations);
            console.log(error);
        }
    }

    async function createDeployment() {
        try {
            if (!site?.providerRepositoryId) {
                await sdk.forProject.sites.update(
                    site.$id,
                    site.name,
                    site.framework as Framework,
                    site.enabled || undefined,
                    site.logging || undefined,
                    site.timeout || undefined,
                    site.installCommand || undefined,
                    site.buildCommand || undefined,
                    site.outputDirectory || undefined,
                    (site?.buildRuntime as BuildRuntime) || undefined,
                    (site.adapter as Adapter) || undefined,
                    site.fallbackFile || undefined,
                    $installation.$id || undefined,
                    selectedRepository || undefined,
                    branch || undefined,
                    site.providerSilentMode || undefined,
                    site.providerRootDirectory || undefined
                );
            }
            if (commit) {
                await sdk.forProject.sites.createVcsDeployment(
                    site.$id,
                    VCSDeploymentType.Commit,
                    commit,
                    activate
                );
            } else if (branch) {
                await sdk.forProject.sites.createVcsDeployment(
                    site.$id,
                    VCSDeploymentType.Branch,
                    branch,
                    activate
                );
            }
            show = false;
            invalidate(Dependencies.DEPLOYMENTS);
            addNotification({
                message: activate
                    ? 'Deployment is in progress. It will be automatically activated after build step completes.'
                    : 'Deployment is in progress. You can activate it after build step completes.',
                type: 'success'
            });
        } catch (e) {
            error = e.message;
        }
    }

    $: console.log($repository);
</script>

<Modal title="Create Git deployment" bind:show onSubmit={createDeployment} bind:error>
    <span slot="description">
        Enter a valid commit reference to create a new deployment. <Link href="#">Learn more</Link>
    </span>
    {#if hasRepository}
        {#await load()}
            <Card padding="xs" radius="s" variant="secondary">
                <Layout.Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="xs">
                    <Layout.Stack direction="row" alignItems="center" gap="s">
                        <Icon size="s" icon={IconGithub} />
                        <Skeleton variant="line" width={100} height={19.6} />
                    </Layout.Stack>
                </Layout.Stack>
            </Card>
            <Layout.Stack gap="s">
                <Skeleton variant="line" width={100} height={19.6} />
                <Skeleton variant="line" width={350} height={31} />
            </Layout.Stack>
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
            <Card padding="xs" radius="s" variant="secondary">
                <Layout.Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="xs">
                    <Layout.Stack direction="row" alignItems="center" gap="s" inline>
                        <Icon icon={IconGithub} />
                        <Link
                            external
                            href={`https://github.com/${$repository?.organization}/${$repository?.name}`}>
                            <Layout.Stack direction="row" alignItems="center" gap="s" inline>
                                {$repository?.organization}/{$repository?.name}
                            </Layout.Stack>
                        </Link>
                    </Layout.Stack>
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Last updated {timeFromNow($repository?.pushedAt)}
                    </Typography.Caption>
                </Layout.Stack>
            </Card>
            <InputSelect
                required={true}
                id="branch"
                label="Production branch"
                placeholder="Select branch"
                bind:value={branch}
                isSearchable
                on:select={(event) => {
                    branch = event.detail.value;
                }}
                {options} />
            <!-- <InputText
                id="commit"
                label="Commit hash"
                placeholder="Select commit"
                bind:value={commit} /> -->
            {#if branch}
                <InputCheckbox
                    label="Activate deployment after build"
                    id="activate"
                    description="This deployment will automatically activate after the build completes. If
                unchecked, it will remain inactive, and you can activate it manually later."
                    bind:checked={activate} />
            {/if}
        {/await}
    {:else}
        <Repositories
            bind:selectedRepository
            installationList={installations}
            product="sites"
            action="button"
            callbackState={{
                createDeployment: 'true'
            }}
            connect={(e) => {
                repository.set(e);
                hasRepository = true;
            }} />
    {/if}
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button submit size="s" disabled={!$installation?.$id || !selectedRepository || !branch}>
            Create
        </Button>
    </svelte:fragment>
</Modal>

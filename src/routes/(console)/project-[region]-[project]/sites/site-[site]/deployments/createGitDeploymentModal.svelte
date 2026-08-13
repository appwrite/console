<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Modal, Card } from '$lib/components';
    import { Repositories, BranchSelector, InstallationError } from '$lib/components/git';
    import { Dependencies } from '$lib/constants';
    import { Link } from '$lib/elements';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { timeFromNow } from '$lib/helpers/date';
    import {
        getVcsInstallationErrorKind,
        type VcsInstallationErrorKind
    } from '$lib/helpers/vcsError';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import {
        Adapter,
        BuildRuntime,
        Framework,
        VCSReferenceType,
        type Models
    } from '@appwrite.io/console';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Skeleton, Typography } from '@appwrite.io/pink-svelte';
    import { untrack } from 'svelte';

    let {
        show = $bindable(false),
        site,
        installations
    }: {
        show?: boolean;
        site: Models.Site;
        installations: Models.InstallationList;
    } = $props();

    // Seeded from the site once, then owned locally: connecting a repository in
    // the modal flips `hasRepository` before the site itself has been updated.
    let hasRepository = $state(untrack(() => !!site?.providerRepositoryId));
    let selectedRepository: string = $state(untrack(() => site.providerRepositoryId));
    let branch: string = $state(null);
    let commit: string = $state(null);
    let activate = $state(true);
    let error = $state('');
    let isLoadingRepository = $state(true);
    /**
     * Looking the repository up refreshes the installation token first, so a
     * dead token fails here rather than on anything to do with the repository.
     * Without this the modal renders a repository card with nothing in it and a
     * branch picker that can never fill, while "Create" stays live for a
     * deployment that cannot be created.
     */
    let installationErrorKind = $state<VcsInstallationErrorKind | null>(null);

    // Deliberately not `$state`: a guard so opening the modal loads once, not
    // something the template reads.
    let loadStarted = false;

    function loadInstallations() {
        if (!site?.installationId && installations?.total > 0) {
            installation.set(installations.installations[0]);
        }
        $installation = installations.installations.find(
            (entry) => entry.$id === site.installationId
        );
        if (!$installation?.$id) {
            $installation = installations.installations[0];
        }
    }

    async function load() {
        isLoadingRepository = true;
        installationErrorKind = null;
        try {
            loadInstallations();
            if (!$repository?.id && hasRepository) {
                $repository = await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.getRepository({
                        installationId: $installation.$id,
                        providerRepositoryId: site.providerRepositoryId
                    });
            }
            selectedRepository = $repository?.id;

            branch = site.providerBranch || 'main';
        } catch (e) {
            installationErrorKind = getVcsInstallationErrorKind(e);
            if (!installationErrorKind) {
                error = e.message;
            }
        } finally {
            isLoadingRepository = false;
        }
    }

    async function createDeployment() {
        try {
            if (!site?.providerRepositoryId) {
                await sdk.forProject(page.params.region, page.params.project).sites.update({
                    siteId: site.$id,
                    name: site.name,
                    framework: site.framework as Framework,
                    enabled: site.enabled ?? undefined,
                    logging: site.logging ?? undefined,
                    timeout: site.timeout || undefined,
                    installCommand: site.installCommand || undefined,
                    buildCommand: site.buildCommand || undefined,
                    startCommand: site.startCommand || undefined,
                    outputDirectory: site.outputDirectory || undefined,
                    buildRuntime: (site?.buildRuntime as BuildRuntime) || undefined,
                    adapter: (site.adapter as Adapter) || undefined,
                    fallbackFile: site.fallbackFile || undefined,
                    installationId: $installation.$id || undefined,
                    providerRepositoryId: selectedRepository || undefined,
                    providerBranch: branch || undefined,
                    providerSilentMode: site.providerSilentMode ?? undefined,
                    providerRootDirectory: site.providerRootDirectory || undefined,
                    deploymentRetention: site.deploymentRetention ?? undefined
                });
            }
            if (commit) {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .sites.createVcsDeployment({
                        siteId: site.$id,
                        type: VCSReferenceType.Commit,
                        reference: commit,
                        activate
                    });
            } else if (branch) {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .sites.createVcsDeployment({
                        siteId: site.$id,
                        type: VCSReferenceType.Branch,
                        reference: branch,
                        activate
                    });
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

    $effect(() => {
        if (!show || !hasRepository || loadStarted) return;
        loadStarted = true;
        load();
    });

    $effect(() => {
        if (show) return;
        error = '';
        branch = null;
        commit = null;
        activate = true;
        hasRepository = !!site?.providerRepositoryId;
        installationErrorKind = null;
        loadStarted = false;
    });
</script>

<Modal title="Create Git deployment" bind:show onSubmit={createDeployment} bind:error>
    <span slot="description">
        Enter a valid commit reference to create a new deployment. <Link
            href="https://appwrite.io/docs/products/sites/deployments#create-deployment"
            external>Learn more</Link>
    </span>
    {#if hasRepository}
        {#if isLoadingRepository}
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
        {:else if installationErrorKind}
            <InstallationError
                kind={installationErrorKind}
                provider={$installation?.provider}
                organization={$installation?.organization}
                onRetry={load} />
        {:else}
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
            <BranchSelector
                bind:value={branch}
                installationId={$installation.$id}
                repositoryId={selectedRepository}
                on:select={(event) => {
                    branch = event.detail;
                }} />
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
        {/if}
    {:else}
        <Repositories
            bind:selectedRepository
            bind:installationErrorKind
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
        <!-- A broken installation fails every call this needs, so offer the
             reconnect above instead of a submit that cannot succeed. -->
        <Button
            submit
            size="s"
            disabled={!!installationErrorKind ||
                !$installation?.$id ||
                !selectedRepository ||
                !branch}>
            Create
        </Button>
    </svelte:fragment>
</Modal>

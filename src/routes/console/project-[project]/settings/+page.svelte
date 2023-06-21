<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '../store';
    import { services, type Service } from '$lib/stores/project-services';
    import { CardGrid, CopyInput, Box, Heading, AvatarGroup } from '$lib/components';
    import { Button, Form, FormList, InputText, InputSwitch } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Delete from './deleteProject.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import type { PageData } from './$types';
    import UpdateVariables from '../updateVariables.svelte';
    import GitInstallationModal from './GitInstallationModal.svelte';
    import { browser } from '$app/environment';
    import PaginationInline from '$lib/components/paginationInline.svelte';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import Table from '$lib/elements/table/table.svelte';
    import { Query, type Models } from '@appwrite.io/console';
    import DropList from '$lib/components/dropList.svelte';
    import DropListItem from '$lib/components/dropListItem.svelte';
    import GitDisconnectModal from './GitDisconnectModal.svelte';

    export let data: PageData;

    const sdkCreateVariable = async (key: string, value: string) => {
        await sdk.forProject.projectApi.createVariable(key, value);
        await invalidate(Dependencies.FUNCTION);
        await invalidate(Dependencies.VARIABLES);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    };

    const sdkUpdateVariable = async (variableId: string, key: string, value: string) => {
        await sdk.forProject.projectApi.updateVariable(variableId, key, value);
        await invalidate(Dependencies.FUNCTION);
        await invalidate(Dependencies.VARIABLES);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk.forProject.projectApi.deleteVariable(variableId);
        await invalidate(Dependencies.FUNCTION);
        await invalidate(Dependencies.VARIABLES);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    };

    let name: string = null;
    let showDelete = false;
    let showGitIstall = false;
    let showGitDisconnect = false;
    let selectedInstallation: Models.Installation;

    const endpoint = sdk.forConsole.client.config.endpoint;
    const projectId = $page.params.project;

    let showInstallationDropdown: boolean[] = [];
    let installationsSum = data.installations.total;
    let installationsLimit = 10;
    let installationsOffset = 0;

    // TODO: Fix. Should not run on initial load. We get data from page.ts
    $: if (installationsOffset !== null) {
        (async () => {
            data.installations = await sdk.forProject.vcs.listInstallations([
                Query.offset(installationsOffset),
                Query.limit(installationsLimit)
            ]);
        })();
    }

    onMount(async () => {
        name ??= $project.name;

        if (browser) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);

            const alert = urlParams.get('alert') ?? '';

            let notified = false;

            if (alert === 'installation-created') {
                addNotification({
                    type: 'success',
                    message: `Git installation has been successfully added`
                });
                trackEvent(Submit.InstallationCreate);
                notified = true;
            } else if (alert === 'installation-updated') {
                addNotification({
                    type: 'success',
                    message: `Git installation has been successfully updated`
                });
                trackEvent(Submit.InstallationCreate);
                notified = true;
            }

            if (notified) {
                window.history.replaceState(
                    {},
                    document.title,
                    window.location.origin + window.location.pathname
                );
            }
        }
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.update($project.$id, name);
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Project name has been updated'
            });
            trackEvent(Submit.ProjectUpdateName);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectUpdateName);
        }
    }

    async function serviceUpdate(service: Service) {
        try {
            await sdk.forConsole.projects.updateServiceStatus(
                $project.$id,
                service.method,
                service.value
            );
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: `${service.label} service has been ${
                    service.value ? 'enabled' : 'disabled'
                }`
            });
            trackEvent(Submit.ProjectService, {
                method: service.method,
                value: service.value
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectService);
        }
    }

    function configureGitHub() {
        sdk.forProject.vcs.createGitHubInstallation(
            window.location.href + '?alert=installation-updated'
        );
    }

    $: services.load($project);

    function getInstallationLink(installation: Models.Installation) {
        if (installation.provider === 'github') {
            return `https://github.com/${installation.organization}`;
        }

        return '';
    }

    function getProviderIcon(provider: string) {
        if (provider === 'github') {
            return `icon-github`;
        }

        return '';
    }
</script>

<Container>
    {#if $project}
        <Form onSubmit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7">API Credentials</Heading>
                <p class="text">Access Appwrite services using your API Endpoint and Project ID.</p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <CopyInput label="Project ID" showLabel={true} value={$project.$id} />
                        <CopyInput label="API Endpoint" showLabel={true} value={endpoint} />
                    </FormList>
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button
                        secondary
                        event="view_keys"
                        href={`${base}/console/project-${projectId}/overview/keys#integrations`}>
                        View API Keys
                    </Button>
                </svelte:fragment>
            </CardGrid>
            <CardGrid>
                <Heading tag="h6" size="7">Name</Heading>

                <svelte:fragment slot="aside">
                    <FormList>
                        <InputText
                            id="name"
                            label="Name"
                            bind:value={name}
                            required
                            placeholder="Enter name" />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $project.name} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid>
            <Heading tag="h6" size="7">Services</Heading>
            <p class="text">
                Choose services you wish to enable or disable for the client API. When disabled, the
                services are not accessible to client SDKs but remain accessible to server SDKs.
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <form class="form">
                        <ul class="form-list is-multiple">
                            {#each $services.list as service}
                                <InputSwitch
                                    label={service.label}
                                    id={service.method}
                                    bind:value={service.value}
                                    on:change={() => {
                                        serviceUpdate(service);
                                    }} />
                            {/each}
                        </ul>
                    </form>
                </FormList>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <Heading tag="h6" size="7">Git configuration</Heading>
            <p class="text">
                Add a Git installation to your project. You can connect a repository in your
                function settings.
            </p>
            <svelte:fragment slot="aside">
                {#if data.installations.total > 0}
                    <div>
                        <div class="u-flex u-flex-vertical-mobile u-main-end">
                            <ul class="buttons-list">
                                <li class="buttons-list-item">
                                    <Button secondary on:click={() => (showGitIstall = true)}>
                                        <span class="icon-plus" />
                                        <span class="text">Add installation</span>
                                    </Button>
                                </li>
                            </ul>
                        </div>

                        <Table noMargin noStyles>
                            <TableHeader>
                                <TableCellHead>Installations</TableCellHead>
                            </TableHeader>
                            <TableBody>
                                {#each data.installations.installations as installation, i}
                                    <TableRow>
                                        <TableCell title="installations">
                                            <div class="u-flex u-main-space-between u-cross-center">
                                                <div
                                                    class="u-flex u-main-start u-cross-center u-gap-8">
                                                    <div class="avatar">
                                                        <span
                                                            class={getProviderIcon(
                                                                installation.provider
                                                            )} />
                                                    </div>
                                                    <div class="u-flex u-flex-vertical">
                                                        <div class="u-flex u-cross-center u-gap-4">
                                                            <h6>{installation.organization}</h6>
                                                            <a
                                                                href={getInstallationLink(
                                                                    installation
                                                                )}
                                                                target="_blank"
                                                                ><span
                                                                    style="font-size: 1rem; color: hsl(var(--color-neutral-70));"
                                                                    class="icon-external-link" /></a>
                                                        </div>
                                                        <p
                                                            class="u-x-small"
                                                            style="color: hsl(var(--color-neutral-70));">
                                                            Last configure: {toLocaleDateTime(
                                                                installation.$updatedAt
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <DropList
                                                        bind:show={showInstallationDropdown[i]}
                                                        placement="bottom-start"
                                                        noArrow>
                                                        <button
                                                            class="button is-text is-only-icon"
                                                            aria-label="more options"
                                                            on:click|preventDefault={() =>
                                                                (showInstallationDropdown[i] =
                                                                    !showInstallationDropdown[i])}>
                                                            <span
                                                                class="icon-dots-horizontal"
                                                                aria-hidden="true" />
                                                        </button>
                                                        <svelte:fragment slot="list">
                                                            <DropListItem
                                                                icon="external-link"
                                                                on:click={() => {
                                                                    showInstallationDropdown[
                                                                        i
                                                                    ] = false;
                                                                    configureGitHub();
                                                                }}>
                                                                Configure {installation.provider}
                                                            </DropListItem>
                                                            <DropListItem
                                                                icon="x-circle"
                                                                on:click={async () => {
                                                                    showInstallationDropdown[
                                                                        i
                                                                    ] = false;
                                                                    showGitDisconnect = true;
                                                                    selectedInstallation =
                                                                        installation;
                                                                }}>
                                                                Disconnect
                                                            </DropListItem>
                                                        </svelte:fragment>
                                                    </DropList>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                {/each}
                            </TableBody>
                        </Table>
                    </div>
                    <div class="u-flex u-main-space-between">
                        <p class="text">Total installations: {installationsSum}</p>
                        <PaginationInline
                            sum={installationsSum}
                            limit={installationsLimit}
                            bind:offset={installationsOffset} />
                    </div>
                {:else}
                    <article class="card-git card is-border-dashed is-no-shadow">
                        <div class="u-flex u-cross-center u-flex-vertical u-gap-32">
                            <div class="u-flex u-cross-center u-flex-vertical u-gap-8">
                                <AvatarGroup icons={['github', 'gitlab', 'bitBucket']} />
                                <span class="icon-arrow-narrow-down" />

                                <div class="avatar"><span class="icon-server" /></div>
                            </div>
                            <Button on:click={() => (showGitIstall = true)} secondary>
                                <span class="text">Add Installation</span>
                            </Button>
                        </div>
                    </article>
                {/if}
            </svelte:fragment>
        </CardGrid>

        <UpdateVariables
            {sdkCreateVariable}
            {sdkUpdateVariable}
            {sdkDeleteVariable}
            isGlobal={true}
            variableList={data.variables} />

        <CardGrid danger>
            <div>
                <Heading tag="h6" size="7">Delete Project</Heading>
            </div>
            <p>
                The project will be permanently deleted, including all the metadata, resources and
                stats within it. This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$project.name}</h6>
                    </svelte:fragment>
                    <p>Last update: {toLocaleDateTime($project.$updatedAt)}</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />

{#if showGitIstall}
    <GitInstallationModal bind:showGitInstall={showGitIstall} />
{/if}

{#if showGitDisconnect}
    <GitDisconnectModal bind:showGitDisconnect {selectedInstallation} />
{/if}

<style lang="scss" global>
    .card-git .avatar {
        border-color: hsl(var(--color-neutral-10));
        border-width: 0.0625rem;
    }

    .theme-dark .card-git .avatar {
        border-color: hsl(var(--color-neutral-150));
    }
</style>

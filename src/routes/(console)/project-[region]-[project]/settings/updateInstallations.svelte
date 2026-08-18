<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Avatar, CardGrid, PaginationInline } from '$lib/components';
    import { Button as FormButton } from '$lib/elements/forms';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import GitDisconnectModal from './GitDisconnectModal.svelte';
    import { isSelfHosted } from '$lib/system';
    import {
        ActionMenu,
        Alert,
        Card,
        Empty,
        Icon,
        Layout,
        Popover,
        Table,
        Button
    } from '@appwrite.io/pink-svelte';
    import { Link as PinkLink } from '@appwrite.io/pink-svelte';
    import {
        IconExternalLink,
        IconGit,
        IconPlus,
        IconXCircle
    } from '@appwrite.io/pink-icons-svelte';
    import { enabledVcsProviders, VCS_PROVIDERS } from '$lib/stores/git';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import type { ComponentType } from 'svelte';
    import { Link } from '$lib/elements';
    import { regionalConsoleVariables, mcpTools } from '../store';
    import { canWriteProjects } from '$lib/stores/roles';

    export let total: number;
    export let limit: number;
    export let offset: number;
    export let installations: Models.Installation[];

    let showGitDisconnect = false;
    let showInstallationDropdown: boolean[] = [];
    let selectedInstallation: Models.Installation;
    const isVcsEnabled = $regionalConsoleVariables?._APP_VCS_ENABLED === true;

    // Not in the SDK's generated types yet -- server already returns it.
    const providers = enabledVcsProviders(
        ($regionalConsoleVariables as { _APP_VCS_PROVIDERS?: string[] })?._APP_VCS_PROVIDERS
    );

    function getInstallationLink(installation: Models.Installation) {
        return (
            VCS_PROVIDERS[installation.provider]?.organizationUrl(installation.organization) ?? ''
        );
    }

    function getProviderIcon(provider: string): ComponentType {
        return VCS_PROVIDERS[provider]?.icon ?? IconGit;
    }

    function configureProvider(provider: string = 'github') {
        const redirect = new URL(page.url);
        redirect.searchParams.append('alert', 'installation-updated');
        const target = new URL(`${getApiEndpoint(page.params.region)}/vcs/${provider}/authorize`);
        target.searchParams.set('project', page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        target.searchParams.set('mode', 'admin');
        return target?.toString();
    }

    async function navigateInstallations() {
        const next = new URL(page.url);
        next.searchParams.set('offset', offset.toString());
        await goto(next, {
            noScroll: true
        });
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Git configuration</svelte:fragment>
    Add a Git installation to your project so you can connect repositories later through your function
    or site settings.
    <svelte:fragment slot="aside">
        {#if total > 0}
            <Layout.Stack gap="l">
                <div class="installations-action-row">
                    {#if providers.length <= 1}
                        <FormButton
                            secondary
                            disabled={!$canWriteProjects}
                            href={configureProvider(providers[0]?.id)}
                            on:click={() => {
                                trackEvent(Click.SettingsInstallProviderClick);
                            }}>
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Add installation
                        </FormButton>
                    {:else}
                        <Popover let:toggle padding="none" placement="bottom-start">
                            <FormButton
                                secondary
                                disabled={!$canWriteProjects}
                                on:click={(event) => {
                                    trackEvent(Click.SettingsInstallProviderClick);
                                    toggle(event);
                                }}>
                                <Icon icon={IconPlus} slot="start" size="s" />
                                Add installation
                            </FormButton>
                            <ActionMenu.Root slot="tooltip">
                                {#each providers as provider (provider.id)}
                                    <ActionMenu.Item.Anchor
                                        href={configureProvider(provider.id)}
                                        leadingIcon={provider.icon}>
                                        Connect to {provider.label}
                                    </ActionMenu.Item.Anchor>
                                {/each}
                            </ActionMenu.Root>
                        </Popover>
                    {/if}
                </div>

                <Table.Root
                    let:root
                    columns={[
                        { id: 'owner', width: { min: 150, max: 500 } },
                        { id: 'updated', width: { min: 150, max: 500 } },
                        { id: 'actions', width: 60 }
                    ]}>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="owner" {root}>Owner</Table.Header.Cell>
                        <Table.Header.Cell column="updated" {root}>Updated</Table.Header.Cell>
                        <Table.Header.Cell column="actions" {root} />
                    </svelte:fragment>
                    {#each installations as installation, i}
                        <Table.Row.Base {root}>
                            <Table.Cell column="owner" {root}>
                                <Layout.Stack direction="row" gap="s" alignItems="center">
                                    <Avatar alt={installation.provider} size="xs">
                                        <Icon
                                            icon={getProviderIcon(installation.provider)}
                                            size="s" />
                                    </Avatar>
                                    <Link href={getInstallationLink(installation)} external icon>
                                        {installation.organization}
                                    </Link>
                                </Layout.Stack>
                            </Table.Cell>
                            <Table.Cell column="updated" {root}>
                                <DualTimeView time={installation.$updatedAt} />
                            </Table.Cell>
                            <Table.Cell column="actions" {root}>
                                <Popover let:toggle padding="none" placement="bottom-end">
                                    <button
                                        type="button"
                                        class="button is-text is-only-icon"
                                        aria-label="more options"
                                        disabled={!$canWriteProjects}
                                        on:click={toggle}>
                                        <span class="icon-dots-horizontal" aria-hidden="true"
                                        ></span>
                                    </button>
                                    <ActionMenu.Root slot="tooltip">
                                        <ActionMenu.Item.Anchor
                                            href={configureProvider(installation.provider)}
                                            trailingIcon={IconExternalLink}
                                            on:click={() => (showInstallationDropdown[i] = false)}>
                                            Configure
                                        </ActionMenu.Item.Anchor>
                                        <ActionMenu.Item.Button
                                            trailingIcon={IconXCircle}
                                            on:click={() => {
                                                showInstallationDropdown[i] = false;
                                                showGitDisconnect = true;
                                                selectedInstallation = installation;
                                            }}>
                                            Disconnect
                                        </ActionMenu.Item.Button>
                                    </ActionMenu.Root>
                                </Popover>
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
                {#if total > limit}
                    <Layout.Stack justifyContent="space-between">
                        <p class="text">Total installations: {total}</p>
                        <PaginationInline
                            {limit}
                            {total}
                            on:change={navigateInstallations}
                            bind:offset />
                    </Layout.Stack>
                {/if}
            </Layout.Stack>
        {:else if isSelfHosted && !isVcsEnabled}
            <Alert.Inline status="info" title="Installing Git on a self-hosted instance">
                Before installing Git in a locally hosted Appwrite project, ensure your environment
                variables are configured.
                <svelte:fragment slot="actions">
                    <FormButton
                        compact
                        href="https://appwrite.io/docs/advanced/self-hosting/configuration/version-control"
                        external>Learn more</FormButton>
                </svelte:fragment>
            </Alert.Inline>
        {:else}
            <Card.Base padding="none" border="dashed">
                <Empty
                    type="secondary"
                    title="No installation was added to the project yet"
                    description="Add an installation to connect repositories">
                    <svelte:fragment slot="actions">
                        <Layout.Stack direction="row">
                            {#each providers as provider (provider.id)}
                                <FormButton
                                    secondary
                                    disabled={!$canWriteProjects}
                                    href={configureProvider(provider.id)}
                                    external>
                                    <Icon icon={provider.icon} size="s" slot="start" />
                                    Connect to {provider.label}
                                </FormButton>
                            {/each}
                        </Layout.Stack>
                    </svelte:fragment>
                </Empty>
            </Card.Base>
        {/if}
    </svelte:fragment>
</CardGrid>

{#if showGitDisconnect}
    <GitDisconnectModal bind:showGitDisconnect {selectedInstallation} />
{/if}

<CardGrid>
    <svelte:fragment slot="title">MCP server</svelte:fragment>
    Spin up an MCP server to stream rich project context to AI tooling, unlocking deeper code understanding
    and better completions.
    <svelte:fragment slot="aside">
        <Card.Base padding="none" border="dashed">
            <Empty type="secondary" title="MCP installation">
                <svelte:fragment slot="description">
                    Deploy the Appwrite MCP server with a single click, or view the <PinkLink.Anchor
                        href="https://appwrite.io/docs"
                        target="_blank"
                        rel="noreferrer">docs</PinkLink.Anchor> for instructions.
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Layout.Stack direction="row" gap="s" wrap="wrap" justifyContent="center">
                        {#each mcpTools as tool}
                            <Button.Anchor
                                href={tool.href}
                                target="_blank"
                                rel="noreferrer"
                                size="s"
                                variant="secondary">
                                <Icon slot="start" icon={tool.icon} size="xs" />
                                {tool.label}
                            </Button.Anchor>
                        {/each}
                    </Layout.Stack>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    </svelte:fragment>
</CardGrid>

<style>
    .installations-action-row {
        display: flex;
        justify-content: flex-start;
    }

    @media (min-width: 769px) {
        .installations-action-row {
            justify-content: flex-end;
        }
    }
</style>

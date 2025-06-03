<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Avatar, CardGrid, PaginationInline } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
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
        Table
    } from '@appwrite.io/pink-svelte';
    import {
        IconExternalLink,
        IconGithub,
        IconPlus,
        IconXCircle
    } from '@appwrite.io/pink-icons-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import type { ComponentType } from 'svelte';
    import { Link } from '$lib/elements';
    import { regionalConsoleVariables } from '../store';

    export let total: number;
    export let limit: number;
    export let offset: number;
    export let installations: Models.Installation[];

    let showGitDisconnect = false;
    let showInstallationDropdown: boolean[] = [];
    let selectedInstallation: Models.Installation;
    const isVcsEnabled = $regionalConsoleVariables?._APP_VCS_ENABLED === true;

    function getInstallationLink(installation: Models.Installation) {
        switch (installation.provider) {
            case 'github':
                return `https://github.com/${installation.organization}`;
            default:
                return '';
        }
    }

    function getProviderIcon(provider: string): ComponentType {
        switch (provider) {
            case 'github':
                return IconGithub;
        }
    }

    function configureGitHub() {
        const redirect = new URL(page.url);
        redirect.searchParams.append('alert', 'installation-updated');
        const target = new URL(
            `${sdk.forProject(page.params.region, page.params.project).client.config.endpoint}/vcs/github/authorize`
        );
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
                <Layout.Stack direction="row" justifyContent="flex-end">
                    <Button
                        secondary
                        href={configureGitHub()}
                        on:click={() => {
                            trackEvent(Click.SettingsInstallProviderClick);
                        }}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add installation
                    </Button>
                </Layout.Stack>

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
                                        on:click={toggle}>
                                        <span class="icon-dots-horizontal" aria-hidden="true"
                                        ></span>
                                    </button>
                                    <ActionMenu.Root slot="tooltip">
                                        <ActionMenu.Item.Anchor
                                            href={configureGitHub()}
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
                    <Button compact href="#" external>Learn more</Button>
                </svelte:fragment>
            </Alert.Inline>
        {:else}
            <Card.Base padding="none" border="dashed">
                <Empty
                    type="secondary"
                    title="No installation was added to the project yet"
                    description="Add an installation to connect repositories">
                    <svelte:fragment slot="actions">
                        <Button secondary href={configureGitHub()} external>
                            <Icon icon={IconGithub} size="s" slot="start" />
                            Connect to GitHub
                        </Button>
                    </svelte:fragment>
                </Empty>
            </Card.Base>
        {/if}
    </svelte:fragment>
</CardGrid>

{#if showGitDisconnect}
    <GitDisconnectModal bind:showGitDisconnect {selectedInstallation} />
{/if}

<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import {
        Alert,
        Arrow,
        AvatarGroup,
        CardGrid,
        DropList,
        DropListItem,
        DropListLink,
        Heading,
        Id,
        PaginationInline,
        SvgIcon
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import GitInstallationModal from './GitInstallationModal.svelte';
    import GitDisconnectModal from './GitDisconnectModal.svelte';
    import dayjs from 'dayjs';
    import { isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';

    export let total: number;
    export let limit: number;
    export let offset: number;
    export let installations: Models.Installation[];

    let showGitIstall = false;
    let showGitDisconnect = false;
    let showInstallationDropdown: boolean[] = [];
    let selectedInstallation: Models.Installation;
    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;

    function getInstallationLink(installation: Models.Installation) {
        switch (installation.provider) {
            case 'github':
                return `https://github.com/${installation.organization}`;
            default:
                return '';
        }
    }

    function getProviderIcon(provider: string): string {
        switch (provider) {
            case 'github':
                return 'icon-github';
            default:
                return '';
        }
    }

    function configureGitHub() {
        const redirect = new URL($page.url);
        redirect.searchParams.append('alert', 'installation-updated');
        const target = new URL(
            `${sdk.forProject($page.params.region, $page.params.project).client.config.endpoint}/vcs/github/authorize`
        );
        target.searchParams.set('project', $page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        target.searchParams.set('mode', 'admin');
        return target?.toString();
    }

    async function navigateInstallations() {
        const next = new URL($page.url);
        next.searchParams.set('offset', offset.toString());
        await goto(next, {
            noScroll: true
        });
    }
</script>

<CardGrid>
    <Heading tag="h6" size="7">Git configuration</Heading>
    <p class="text">
        Add a Git installation to your project. You can connect a repository in your function
        settings.
    </p>
    <svelte:fragment slot="aside">
        {#if total > 0}
            <div>
                <div class="u-flex u-flex-vertical-mobile u-main-end u-padding-block-end-16">
                    <ul class="buttons-list">
                        <li class="buttons-list-item">
                            <Button secondary on:click={() => (showGitIstall = true)}>
                                <span class="icon-plus" />
                                <span class="text">Add installation</span>
                            </Button>
                        </li>
                    </ul>
                </div>

                <div style="overflow: auto">
                    <Table noMargin noStyles isAutoLayout>
                        <TableHeader>
                            <TableCellHead width={150}>Installation ID</TableCellHead>
                            <TableCellHead>Repository</TableCellHead>
                            <TableCellHead>Updated</TableCellHead>
                            <TableCellHead width={40} />
                        </TableHeader>
                        <TableBody>
                            {#each installations as installation, i}
                                <TableRow>
                                    <TableCell title="installations">
                                        <Id value={installation.$id}>{installation.$id}</Id>
                                    </TableCell>
                                    <TableCell title="repository">
                                        <div class="u-flex u-gap-8 u-cross-center">
                                            <div class="avatar is-size-small">
                                                <span
                                                    class={getProviderIcon(installation.provider)}
                                                    style="font-size: var(--icon-size-medium)!important" />
                                            </div>
                                            <a
                                                href={getInstallationLink(installation)}
                                                target="_blank"
                                                class="u-flex u-gap-4 u-cross-center">
                                                <span>{installation.organization}</span><span
                                                    style="font-size: 1rem; color: hsl(var(--color-neutral-70));"
                                                    class="icon-external-link" /></a>
                                        </div>
                                    </TableCell>
                                    <TableCellText title="updated">
                                        {dayjs().to(installation.$updatedAt)}
                                    </TableCellText>

                                    <TableCell>
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
                                                <DropListLink
                                                    href={configureGitHub()}
                                                    icon="external-link"
                                                    on:click={() => {
                                                        showInstallationDropdown[i] = false;
                                                    }}>
                                                    Configure
                                                </DropListLink>
                                                <DropListItem
                                                    icon="x-circle"
                                                    on:click={async () => {
                                                        showInstallationDropdown[i] = false;
                                                        showGitDisconnect = true;
                                                        selectedInstallation = installation;
                                                    }}>
                                                    Disconnect
                                                </DropListItem>
                                            </svelte:fragment>
                                        </DropList>
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div class="u-flex u-main-space-between">
                <p class="text">Total installations: {total}</p>
                <PaginationInline
                    {limit}
                    sum={total}
                    on:change={navigateInstallations}
                    bind:offset />
            </div>
        {:else}
            {#if isSelfHosted && !isVcsEnabled}
                <Alert type="info">
                    <svelte:fragment slot="title">
                        Installing Git to a self-hosted instance
                    </svelte:fragment>
                    When installing Git in a locally hosted Appwrite project, you must first configure
                    environment variables.
                    <svelte:fragment slot="buttons">
                        <Button
                            href="https://appwrite.io/docs/advanced/self-hosting/functions"
                            external
                            text>
                            Learn more
                        </Button>
                    </svelte:fragment>
                </Alert>
            {/if}
            <article class="card-git card is-border-dashed is-no-shadow">
                <div class="u-flex u-cross-center u-flex-vertical u-gap-32">
                    <div class="u-flex u-cross-center u-flex-vertical u-gap-8">
                        <AvatarGroup
                            class="git-installation-avatar-group"
                            bordered
                            icons={['github', 'gitlab', 'bitBucket', 'azure']} />

                        <Arrow direction="down" />

                        <div class="avatar"><SvgIcon name="appwrite" type="color" size={80} /></div>
                    </div>
                    <Button
                        disabled={isSelfHosted && !isVcsEnabled}
                        on:click={() => (showGitIstall = true)}
                        secondary>
                        <span class="text">Add Installation</span>
                    </Button>
                </div>
            </article>
        {/if}
    </svelte:fragment>
</CardGrid>

{#if showGitIstall}
    <GitInstallationModal bind:showGitInstall={showGitIstall} />
{/if}

{#if showGitDisconnect}
    <GitDisconnectModal bind:showGitDisconnect {selectedInstallation} />
{/if}

<style>
    :global(.git-installation-avatar-group .icon-gitlab, .icon-bitBucket, .icon-azure) {
        color: hsl(var(--color-neutral-50));
    }
</style>

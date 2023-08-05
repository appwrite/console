<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import {
        AvatarGroup,
        CardGrid,
        DropList,
        DropListItem,
        Heading,
        PaginationInline
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import GitInstallationModal from './GitInstallationModal.svelte';
    import GitDisconnectModal from './GitDisconnectModal.svelte';

    export let total: number;
    export let limit: number;
    export let offset: number;
    export let installations: Models.Installation[];

    let showGitIstall = false;
    let showGitDisconnect = false;
    let showInstallationDropdown: boolean[] = [];
    let selectedInstallation: Models.Installation;

    enum ProviderNames {
        github = 'GitHub',
        gitlab = 'GitLab',
        bitBucket = 'BitBucket'
    }

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
        const target = new URL(`${sdk.forProject.client.config.endpoint}/v1/vcs/github/authorize`);
        target.searchParams.set('projectId', $page.params.project);
        target.searchParams.set('success', redirect.toString());
        target.searchParams.set('failure', redirect.toString());
        goto(target);
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
                        {#each installations as installation, i}
                            <TableRow>
                                <TableCell title="installations">
                                    <div class="u-flex u-main-space-between u-cross-center">
                                        <div class="u-flex u-main-start u-cross-center u-gap-8">
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
                                                        href={getInstallationLink(installation)}
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
                                                            showInstallationDropdown[i] = false;
                                                            configureGitHub();
                                                        }}>
                                                        Configure {ProviderNames[
                                                            installation.provider
                                                        ]}
                                                    </DropListItem>
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
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>
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
            <article class="card-git card is-border-dashed is-no-shadow">
                <div class="u-flex u-cross-center u-flex-vertical u-gap-32">
                    <div class="u-flex u-cross-center u-flex-vertical u-gap-8">
                        <AvatarGroup icons={['github', 'gitlab', 'bitBucket', 'azure']} />
                        <span class="icon-arrow-narrow-down" />

                        <div class="avatar"><span class="icon-appwrite" /></div>
                    </div>
                    <Button on:click={() => (showGitIstall = true)} secondary>
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

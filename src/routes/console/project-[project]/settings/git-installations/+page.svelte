<script lang="ts">
    import { DropList, DropListItem, Empty, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';
    import Delete from './delete.svelte';

    export let data: PageData;

    const providers = [
        {
            name: 'GitHub',
            icon: 'github',
            redirect: () => {
                sdkForProject.vcs.createGitHubInstallation(window.location.href);
            }
        }
    ];

    let showCreateDropdown = false;

    let showDelete = false;
    let selectedInstallation: Models.Installation;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Git Installations</Heading>

        <DropList bind:show={showCreateDropdown} scrollable>
            <slot>
                <Button
                    on:click={() => (showCreateDropdown = !showCreateDropdown)}
                    event="create_installation">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create installation</span>
                </Button>
            </slot>
            <svelte:fragment slot="list">
                {#each providers as provider}
                    <DropListItem
                        icon={provider.icon}
                        on:click={() => {
                            provider.redirect();
                            showCreateDropdown = false;
                        }}>
                        {provider.name}
                    </DropListItem>
                {/each}
            </svelte:fragment>
        </DropList>
    </div>
    {#if data.installations.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={150}>Installation ID</TableCellHead>
                <TableCellHead width={150}>Installation Organization</TableCellHead>
                <TableCellHead width={60}>Provider</TableCellHead>
                <TableCellHead width={40} />
            </TableHeader>
            <TableBody>
                {#each data.installations.installations as installation}
                    <TableRow>
                        <TableCellText title="ID">
                            {installation.$id}
                        </TableCellText>
                        <TableCellText title="Organization">
                            {installation.organization}
                        </TableCellText>
                        <TableCellText title="Provider">{installation.provider}</TableCellText>
                        <TableCell title="Actions">
                            <div class="u-flex u-gap-8 u-cross-center u-main-end">
                                <button
                                    class="button is-text is-only-icon u-padding-inline-0"
                                    style="--p-button-size: var(--button-size, 2.0rem);"
                                    aria-label="Verify item"
                                    on:click={() => {
                                        const provider = providers.find(
                                            (provider) => provider.name === installation.provider
                                        );
                                        if (provider) {
                                            provider.redirect();
                                        }
                                    }}>
                                    <span class="icon-cog" aria-hidden="true" />
                                </button>
                                <button
                                    class="button tooltip is-text is-only-icon u-padding-inline-0"
                                    style="--p-button-size: var(--button-size, 2.0rem);"
                                    aria-label="Delete item"
                                    on:click={async () => {
                                        showDelete = true;
                                        selectedInstallation = installation;
                                    }}>
                                    <span class="icon-trash" aria-hidden="true" />
                                    <span class="tooltip-popup is-bottom" role="tooltip">
                                        Delete
                                    </span>
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>
    {:else}
        <Empty single target="installation" />
    {/if}
</Container>

<Delete bind:showDelete bind:selectedInstallation />

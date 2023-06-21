<!-- 
    This is the root command panel. It precedes all other command panels.
 -->
<script lang="ts">
    import { commands, type Command } from '../commands';
    import { isMac } from '$lib/helpers/platform';
    import Template from './template.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Query } from '@appwrite.io/console';
    import { goto } from '$app/navigation';
    import { project } from '$routes/console/project-[project]/store';
    import { database } from '$routes/console/project-[project]/databases/database-[database]/store';
    import { debounce } from '$lib/helpers/debounce';

    let search = '';

    let searchResults: Omit<Command, 'keys'>[] = [];
    const executeSearch = debounce(async (s: string) => {
        const newResults: typeof searchResults = [];
        const { databases } = await sdk.forProject.databases.list([Query.limit(20)]);
        newResults.push(
            ...databases
                .filter((db) => db.name.includes(s))
                .map((db) => {
                    return {
                        label: `Go to ${db.name} database`,
                        callback: () => {
                            goto(`/console/project-${$project.$id}/databases/database-${db.$id}`);
                        },
                        group: 'databases'
                    } as const;
                })
        );

        if ($database?.$id) {
            const { collections } = await sdk.forProject.databases.listCollections($database.$id, [
                Query.limit(20)
            ]);
            newResults.push(
                ...collections
                    .filter((collection) => collection.name.includes(s))
                    .map((collection) => {
                        return {
                            label: `Go to ${collection.name} collection`,
                            callback: () => {
                                goto(
                                    `/console/project-${$project.$id}/databases/database-${$database.$id}/collection-${collection.$id}`
                                );
                            },
                            group: 'databases'
                        } as const;
                    })
            );
        }

        searchResults = [...newResults];
    }, 500);

    $: {
        if (search) {
            searchResults = [];
            executeSearch(search);
        } else searchResults = [];
    }

    $: results = [
        ...$commands.filter((command) => {
            return (
                !command.disabled &&
                command.label &&
                command.label.toLowerCase().includes(search.toLowerCase())
            );
        }),
        ...searchResults
    ] as Array<Command | Omit<Command, 'keys'>>;
</script>

<Template options={results} bind:search>
    <div slot="option" class="u-flex u-main-space-between content" let:option={command}>
        <span>
            {command.label}
        </span>
        <div class="u-flex u-gap-4 u-cross-center">
            {#if command.ctrl}
                <kbd class="kbd"> {isMac() ? '⌘' : 'ctrl'} </kbd>
            {/if}
            {#if command.shift}
                <kbd class="kbd"> {isMac() ? '⇧' : 'shift'} </kbd>
            {/if}
            {#if command.alt}
                <kbd class="kbd"> {isMac() ? '⌥' : 'alt'} </kbd>
            {/if}
            {#if 'keys' in command}
                {#each command.keys as key, i}
                    {@const hasNext = command.keys.length - 1 !== i}

                    <kbd class="kbd">
                        {key.toUpperCase()}
                    </kbd>
                    {#if hasNext}
                        <span class="u-margin-inline-4" style:opacity={0.5}>then</span>
                    {/if}
                {/each}
            {/if}
        </div>
    </div>
    <svelte:fragment slot="no-options">No commands found</svelte:fragment>
    <div
        slot="footer"
        class="footer u-margin-block-start-16 u-flex u-flex u-cross-center u-main-space-between">
        <div class="u-flex u-cross-center u-gap-4">
            <kbd class="kbd">Enter</kbd> <span>to select and close</span>
        </div>
        <div class="u-flex u-cross-center u-gap-4">
            <kbd class="kbd">Esc</kbd> <span>to close</span>
        </div>
    </div>
</Template>

<style lang="scss">
    .kbd {
        padding-inline: 0.25rem;
    }

    .footer {
        border-top: 1px solid hsl(var(--color-border));
        margin-inline: -0.5rem;
        padding-inline: 1rem;
        padding-block-start: 0.5rem;

        .kbd {
            background-color: hsl(var(--color-neutral-150));
            padding: 4.5px 3.5px;
        }
    }
</style>

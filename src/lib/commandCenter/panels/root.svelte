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

    const hasCtrl = (command: Command) => {
        return 'ctrl' in command && command.ctrl;
    };

    const hasShift = (command: Command) => {
        return 'shift' in command && command.shift;
    };

    const hasAlt = (command: Command) => {
        return 'alt' in command && command.alt;
    };
</script>

<Template options={results} bind:search searchPlaceholder="Search for commands or content...">
    <div slot="option" class="u-flex u-main-space-between content" let:option={command}>
        <div class="u-flex u-gap-8 u-cross-center">
            <i class="icon-{command.icon ?? 'arrow-sm-right'}" />
            <span>
                {command.label}
            </span>
        </div>
        <div class="u-flex u-gap-4 u-cross-center">
            {#if hasCtrl(command)}
                <kbd class="kbd"> {isMac() ? '⌘' : 'Ctrl'} </kbd>
            {/if}
            {#if hasShift(command)}
                <kbd class="kbd"> {isMac() ? '⇧' : 'Shift'} </kbd>
            {/if}
            {#if hasAlt(command)}
                <kbd class="kbd"> {isMac() ? '⌥' : 'Alt'} </kbd>
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
</Template>

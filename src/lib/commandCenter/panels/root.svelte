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

    let search = '';

    let searchResults: Omit<Command, 'keys'>[] = [];
    async function executeSearch(s: string) {
        const { databases } = await sdk.forProject.databases.list([Query.limit(20)]);
        console.log(databases.filter((db) => db.name.includes(s)));
        searchResults = databases
            .filter((db) => db.name.includes(s))
            .map((db) => {
                return {
                    label: db.name,
                    callback: () => {
                        goto(`/console/project-${$project.$id}/databases/${db.$id}`);
                    },
                    group: 'databases'
                };
            });
    }

    $: executeSearch(search);

    $: results = [
        ...$commands.filter((command) => {
            return (
                !command.disabled &&
                command.label &&
                command.label.toLowerCase().includes(search.toLowerCase())
            );
        }),
        ...searchResults
    ];
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
            {#if commands.keys}
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

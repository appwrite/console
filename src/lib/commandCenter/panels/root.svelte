<!-- 
    This is the root command panel. It precedes all other command panels.
 -->
<script lang="ts">
    import { commands } from '../commands';
    import { isMac } from '$lib/helpers/platform';
    import Template from './template.svelte';

    let search = '';

    $: results = $commands.filter((command) => {
        return (
            !command.disabled &&
            command.label &&
            command.label.toLowerCase().includes(search.toLowerCase())
        );
    });
</script>

<Template options={results}>
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
            {#each command.keys as key, i}
                {@const hasNext = command.keys.length - 1 !== i}

                <kbd class="kbd">
                    {key.toUpperCase()}
                </kbd>
                {#if hasNext}
                    <span class="u-margin-inline-4" style:opacity={0.5}>then</span>
                {/if}
            {/each}
        </div>
    </div>
    <svelte:fragment slot="no-options">No commands found</svelte:fragment>
</Template>

<style>
    .kbd {
        padding-inline: 0.25rem;
    }
</style>

<script lang="ts">
    import Dialog from '$lib/components/dialog.svelte';
    import { CommandRegistrant, commands, commandCenter } from '$lib/helpers/commandCenter';
    import { isMac } from '$lib/helpers/platform';

    let open = false;
    let search = '';
    let selected = 0;

    const { register } = CommandRegistrant();
    $: register([
        {
            callback: () => {
                open = !open;
            },
            keys: ['k'],
            meta: true,
            forceEnable: true
        }
    ]);

    $: results = $commands.filter((command) => {
        return (
            !command.disabled &&
            command.label &&
            command.label.toLowerCase().includes(search.toLowerCase())
        );
    });

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            selected = selected === results.length - 1 ? 0 : selected + 1;
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            selected = selected === 0 ? results.length - 1 : selected - 1;
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (results[selected]) {
                results[selected].callback();
                open = false;
                search = '';
            }
        }
    }

    $: {
        results;
        selected = 0;
    }

    $: $commandCenter.enabled = !open;
</script>

<svelte:window on:keydown={handleKeyDown} />

<Dialog bind:show={open}>
    <div class="u-flex u-flex-vertical u-width-full-line">
        <input type="text" placeholder="type here..." autofocus bind:value={search} />

        <ul class="u-margin-block-start-16 u-flex u-flex-vertical u-gap-8">
            {#each results as command, i}
                <li
                    class="u-flex u-main-space-between result"
                    data-selected={selected === i ? true : undefined}>
                    <span>
                        {command.label}
                    </span>
                    <div class="u-flex u-gap-4">
                        {#if command.meta}
                            <kbd class="kbd"> {isMac ? '⌘' : 'ctrl'} </kbd>
                        {/if}
                        {#if command.shift}
                            <kbd class="kbd"> ⇧ </kbd>
                        {/if}
                        {#if command.alt}
                            <kbd class="kbd"> {isMac ? '⌥' : 'alt'} </kbd>
                        {/if}
                        {#each command.keys as key}
                            <kbd class="kbd">
                                {key.toUpperCase()}
                            </kbd>
                        {/each}
                    </div>
                </li>
            {:else}
                <li class="result">
                    <span class="text">No commands found</span>
                </li>
            {/each}
        </ul>
    </div>
</Dialog>

<style>
    input {
        border: none;
        background-color: transparent;
    }

    .result {
        border-radius: 0.25rem;
        padding: 0.5rem 0.75rem;
    }

    .result[data-selected] {
        background-color: hsl(var(--color-neutral-200));
    }
</style>

<script lang="ts">
    import Dialog from '$lib/components/dialog.svelte';
    import { commands, disableCommands, registerCommand } from '$lib/helpers/commandCenter';
    import { isMac } from '$lib/helpers/platform';
    import { bounceOut, elasticOut, quadOut } from 'svelte/easing';
    import { crossfade } from 'svelte/transition';

    let open = false;
    let search = '';
    let selected = 0;

    $: $registerCommand([
        {
            callback: () => {
                open = !open;
            },
            keys: ['k'],
            ctrl: true,
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

    $: $disableCommands(open);

    const [send, receive] = crossfade({
        duration: 150,
        easing: quadOut
    });
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
                    {#if selected === i}
                        <div class="bg" in:send={{ key: 'bg' }} out:receive={{ key: 'bg' }} />
                    {/if}
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
        padding: 0.5rem 0.75rem;
        transition: 150ms;
        position: relative;
    }

    .result .bg {
        position: absolute;
        inset: 0;
        background-color: hsl(var(--color-neutral-200));
        border-radius: 0.75rem;
        translate: 0 -1px;

        z-index: -1;
    }

    /* .result[data-selected] {
        background-color: hsl(var(--color-neutral-200));
    } */

    .kbd {
        padding-inline: 0.25rem;
    }
</style>

<!-- 
    This is the root command panel. It precedes all other command panels.
 -->
<script lang="ts">
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { debounce } from '$lib/helpers/debounce';
    import { isMac } from '$lib/helpers/platform';
    import { commands, searchers, type Command, isKeyedCommand } from '../commands';
    import Template from './template.svelte';
    import { Icon, Keyboard, Layout } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';

    let search = '';

    let searchResults: Omit<Command, 'keys'>[] = [];
    const executeSearch = debounce(async (s: string) => {
        $searchers.forEach(async (searcher) => {
            const results = await searcher(s);
            searchResults = [...searchResults, ...results];
        });
    }, 500);

    $: {
        if (search) {
            searchResults = [];
            executeSearch(search);
        } else {
            searchResults = [];
            executeSearch.cancel();
        }
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

<Template options={results} bind:search searchPlaceholder="Search...">
    <Layout.Stack
        slot="option"
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        let:option={command}>
        <Layout.Stack direction="row" alignItems="center" gap="s">
            {#if command.image}
                <img
                    src={`${base}/icons/${$app.themeInUse}/color/${command.image}.svg`}
                    alt={command.label} />
            {:else if command.icon}
                <Icon icon={command.icon} size="s" color="--fgcolor-neutral-tertiary" />
            {:else}
                <Icon icon={IconArrowSmRight} size="s" color="--fgcolor-neutral-tertiary" />
            {/if}
            <span>
                {command.label}
            </span>
        </Layout.Stack>
        <Layout.Stack direction="row" justifyContent="flex-end" alignItems="center" gap="s">
            {#if hasCtrl(command)}
                <Keyboard autoWidth={!isMac()} key={isMac() ? '⌘' : 'Ctrl'} />
            {/if}
            {#if hasShift(command)}
                <Keyboard autoWidth={!isMac()} key={isMac() ? '⇧' : 'Shift'} />
            {/if}
            {#if hasAlt(command)}
                <Keyboard autoWidth={!isMac()} key={isMac() ? '⌥' : 'Alt'} />
            {/if}
            {#if isKeyedCommand(command)}
                {#each command.keys as key, i}
                    {@const hasNext = command.keys.length - 1 !== i}

                    <Keyboard key={key.toUpperCase()} />
                    {#if hasNext}
                        <span class="then">then</span>
                    {/if}
                {/each}
            {/if}
        </Layout.Stack>
    </Layout.Stack>
    <svelte:fragment slot="no-options">No commands found</svelte:fragment>
</Template>

<style>
    .then {
        color: var(--fgcolor-neutral-tertiary, #97979b);
        font-size: var(--font-size-s, 14px);
        font-weight: 400;
    }
</style>

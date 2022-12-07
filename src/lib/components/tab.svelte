<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';

    export let selected = false;
    export let href: string = null;
    export let event: string = null;

    function track() {
        if (!event) return;
        trackEvent(`click_select_tab_${event}`);
    }
</script>

<li class="tabs-item">
    {#if href}
        <a class="tabs-button" {href} class:is-selected={selected} on:click={track}>
            <span class="text"><slot /></span>
        </a>
    {:else}
        <button
            type="button"
            class="tabs-button"
            class:is-selected={selected}
            on:click|preventDefault
            on:click={track}>
            <span class="text"><slot /></span>
        </button>
    {/if}
</li>

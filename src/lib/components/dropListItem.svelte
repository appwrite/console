<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';

    export let disabled = false;
    export let icon: string = null;
    export let event: string = null;
    export let eventParams: Record<string, unknown> = {};
    export let loading = false;

    function track() {
        if (!event) {
            return;
        }

        trackEvent(`click_${event}`, {
            from: 'button',
            ...eventParams
        });
    }
</script>

<li class="drop-list-item">
    <button
        class="drop-button u-flex u-cross-center u-main-space-between"
        on:click={track}
        on:click|preventDefault
        {disabled}>
        <span class="text"><slot /></span>
        {#if icon}
            <span class={`icon-${icon}`} aria-hidden="true" />
        {/if}
        {#if loading}
            <span class="loader is-small u-line-height-1-5" aria-hidden="true" />
        {/if}
    </button>
</li>

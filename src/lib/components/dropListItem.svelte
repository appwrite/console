<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';

    export let disabled = false;
    export let icon: string = null;
    export let event: string = null;
    export let loading = false;
    export let padding: number | null = null;

    function track() {
        if (!event) {
            return;
        }

        trackEvent(`click_${event}`, {
            from: 'button'
        });
    }
</script>

<li class="drop-list-item">
    <button
        class="drop-button u-flex u-cross-center u-main-space-between"
        style:--button-padding-horizontal={padding ? `${padding / 16}rem` : ''}
        style:--button-padding-vertical={padding ? `${padding / 16}rem` : ''}
        on:click={track}
        on:click|preventDefault
        {disabled}>
        <span class="text"><slot /></span>
        {#if icon}
            <span class={`icon-${icon}`} aria-hidden="true"></span>
        {/if}
        {#if loading}
            <span class="loader is-small u-line-height-1-5" aria-hidden="true"></span>
        {/if}
    </button>
</li>

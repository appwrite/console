<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';

    export let href: string;
    export let icon: string = null;
    export let disabled = false;
    export let external = false;
    export let event: string = null;
    export let iconStyle: string = '';

    function track() {
        if (!event) {
            return;
        }

        trackEvent(`click_${event}`, {
            from: 'drop-list-link'
        });
    }
</script>

<li class="drop-list-item">
    <a
        on:click
        on:click={track}
        {href}
        class="drop-button"
        class:is-disabled={disabled}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}>
        <span class="text"><slot /></span>
        {#if icon}
            <span class={`icon-${icon}`} style={iconStyle} aria-hidden="true" />
        {/if}
    </a>
</li>

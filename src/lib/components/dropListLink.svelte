<script lang="ts">
    export let href: string;
    export let icon: string = null;
    export let disabled = false;
    export let external = false;
</script>

<li class="drop-list-item">
    <a
        on:click
        {href}
        class="drop-button"
        class:is-disabled={disabled}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}>
        <span class="text"><slot /></span>
        {#if icon}
            <span class={`icon-${icon}`} aria-hidden="true" />
        {/if}
    </a>
</li>

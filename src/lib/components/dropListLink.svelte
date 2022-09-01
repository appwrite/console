<script lang="ts">
    export let href: string;
    export let icon: string = null;
</script>

<li class="drop-list-item" on:click>
    <a {href} class="drop-button">
        <span class="text"><slot /></span>
        {#if icon}
            <span class={`icon-${icon}`} aria-hidden="true" />
        {/if}
    </a>
</li>

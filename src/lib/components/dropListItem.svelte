<script lang="ts">
    export let icon: string = null;
</script>

<li class="drop-list-item">
    <button class="drop-list-button" on:click>
        {#if icon}
            <span class={`icon-${icon}`} aria-hidden="true" />
        {/if}
        <span class="text"><slot /></span>
    </button>
</li>

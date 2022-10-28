<script lang="ts">
    export let disabled = false;
    export let icon: string = null;
</script>

<li class="drop-list-item">
    <button class="drop-button" on:click|preventDefault {disabled}>
        <span class="text"><slot /></span>
        {#if icon}
            <span class={`icon-${icon}`} aria-hidden="true" />
        {/if}
    </button>
</li>

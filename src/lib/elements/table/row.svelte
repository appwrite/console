<script lang="ts">
    export let link: string|undefined = undefined;
</script>

{#if link}
    <a class="table-row" href={link}>
        <slot />
    </a>
{:else}
    <div class="table-row" role="row">
        <slot />
    </div>
{/if}
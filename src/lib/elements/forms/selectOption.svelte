<script lang="ts">
    export let id: string = null;
    export let text: string[] = [];
</script>

<div class="u-flex u-cross-baseline u-gap-12">
    <span
        class="u-flex-basis-140 u-flex-shrink-0 u-text-start u-trim-start u-x-small u-color-text-gray"
        >{id}</span>
    <span class="u-flex-1 u-trim-1">
        {#each text as t, i}
            {t}{i < text.length - 1 ? ', ' : ''}
        {/each}
    </span>
</div>

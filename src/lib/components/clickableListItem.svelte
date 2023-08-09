<script lang="ts">
    export let href: string;
</script>

<li class="clickable-list-item">
    <a {href} class="clickable-list-button" on:click>
        {#if $$slots.default}
            <h5 class="clickable-list-title u-trim-1">
                <slot />
            </h5>
        {/if}
        {#if $$slots.desc}
            <div class="clickable-list-desc">
                <p class="text u-margin-block-start-8"><slot name="desc" /></p>
            </div>
        {/if}
    </a>
</li>

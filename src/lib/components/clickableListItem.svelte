<script lang="ts">
    export let href: string = null;
    export let external: boolean = false;
</script>

<li class="clickable-list-item">
    {#if href}
        <a
            {href}
            class="clickable-list-button"
            target={external ? '_blank' : ''}
            rel={external ? 'noopener noreferrer' : ''}
            on:click>
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
    {:else}
        <button class="clickable-list-button u-width-full-line" on:click>
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
        </button>
    {/if}
</li>

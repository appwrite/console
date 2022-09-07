<script lang="ts">
    import { onMount } from 'svelte';
    import { Pill } from '$lib/elements';
    export let href: string;

    let options: HTMLElement;
    let itemWidth: number;
    let more = 0;

    const isOverflowing = () => {
        if ($$slots.default) {
            for (let i = 0; i < options?.childElementCount; i++) {
                if (itemWidth < options?.offsetWidth + 40) {
                    if (options && options?.lastElementChild) {
                        options.lastElementChild.remove();
                        more++;
                    }
                }
            }
        }
    };

    onMount(() => {
        isOverflowing();
    });
</script>

<a class="card" {href}>
    <div class="grid-item-1" bind:offsetWidth={itemWidth}>
        <div class="eyebrow-heading-3"><slot name="eyebrow" /></div>
        <h2 class="heading-level-6"><slot name="title" /></h2>
        <div class="status">
            <slot name="status" />
        </div>
        <div class="options" style="flex-wrap: nowrap !important;" bind:this={options}>
            <slot />
            {#if more}
                <Pill>
                    +{more}
                </Pill>
            {/if}
        </div>
        <ul class="icons u-flex u-gap-8">
            <slot name="icons" />
        </ul>
    </div>
</a>

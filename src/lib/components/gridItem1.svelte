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
    <div class="grid-item-1">
        <div class="grid-item-1-start-start">
            <div class="eyebrow-heading-3"><slot name="eyebrow" /></div>
            <h2 class="heading-level-6"><slot name="title" /></h2>
        </div>
        <div class="grid-item-1-start-end">
            <slot name="status" />
        </div>

        <div class="grid-item-1-end-start">
            <div
                class="u-flex u-gap-16 u-flex-wrap"
                style="flex-wrap: nowrap !important;"
                bind:this={options}>
                <slot />
                {#if more}
                    <Pill>
                        +{more}
                    </Pill>
                {/if}
            </div>
        </div>
        <div class="grid-item-1-end-end">
            <ul class="icons u-flex u-gap-8">
                <slot name="icons" />
            </ul>
        </div>
    </div>
</a>

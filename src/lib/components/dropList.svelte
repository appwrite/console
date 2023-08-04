<script lang="ts">
    import { Drop } from '.';
    import type { Placement } from './drop.svelte';

    export let show = false;
    export let placement: Placement = 'bottom-start';
    export let scrollable = false;
    export let childStart = false;
    export let noArrow = false;
    export let width: string = null;
</script>

<Drop bind:show {placement} {childStart} {noArrow}>
    <slot />
    <svelte:fragment slot="list">
        <div
            class="drop is-no-arrow"
            style={`${
                width
                    ? `--drop-width-size-desktop:${width}rem; position:relative`
                    : ' position:relative'
            }`}>
            {#if $$slots.list}
                <section
                    class:u-overflow-y-auto={scrollable}
                    class:u-max-height-200={scrollable}
                    class="drop-section">
                    <ul class="drop-list">
                        <slot name="list" />
                    </ul>
                </section>
            {/if}
            <slot name="other" />
        </div>
    </svelte:fragment>
</Drop>

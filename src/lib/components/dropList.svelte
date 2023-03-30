<script lang="ts">
    import { Drop } from '.';
    import type { Placement } from './drop.svelte';

    export let show = false;
    export let placement: Placement = 'bottom-start';
    export let fixed = false;
    export let scrollable = false;
    export let childStart = false;
    export let noArrow = false;
    export let noStyle = false;
    export let width: string = null;
    export let fullWidth = false;
    export let position: 'relative' | 'static' = 'relative';
</script>

<Drop bind:show {placement} {childStart} {noArrow} {noStyle} {fullWidth} {fixed}>
    <slot />
    <svelte:fragment slot="list">
        <div
            class="drop is-no-arrow"
            class:u-max-width-100-percent={fullWidth}
            style={`${width ? `--drop-width-size-desktop:${width}rem; ` : ''} ${
                position === 'static' ? 'position:static' : 'position:relative'
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

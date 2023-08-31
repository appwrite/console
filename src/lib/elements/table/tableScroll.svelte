<script lang="ts">
    import type { Action } from 'svelte/action';

    export let isSticky = false;
    export let noMargin = false;
    let isOverflowing = false;

    const hasOverflow: Action<HTMLDivElement, any> = (node) => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                let overflowing = false;
                if (entry.contentRect.width < entry.target.scrollWidth) {
                    overflowing = true;
                }

                const cols = entry.target.querySelectorAll('.table-thead-col');
                for (let i = 0; i < cols.length; i++) {
                    const col = cols[i];
                    const cs = getComputedStyle(col);
                    const innerWidth =
                        col.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
                    if (innerWidth < 32) {
                        overflowing = true;
                    }
                }

                isOverflowing = overflowing;
            }
        });

        observer.observe(node);

        return {
            destroy() {
                observer.disconnect();
            }
        };
    };
</script>

<div class="table-with-scroll" class:u-margin-block-start-32={!noMargin} data-private>
    <div class="table-wrapper" use:hasOverflow={(v) => (isOverflowing = v)}>
        <table class="table" class:is-sticky-scroll={isSticky && isOverflowing}>
            <slot />
        </table>
    </div>
</div>

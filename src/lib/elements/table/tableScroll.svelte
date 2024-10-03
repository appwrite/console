<script lang="ts">
    import type { Action } from 'svelte/action';

    export let isSticky = false;
    export let noMargin = false;
    export let style = '';
    export let transparent = false;
    export let noStyles = false;
    export let dense = false;
    let classes: string = '';
    export { classes as class };

    let isOverflowing = false;

    const hasOverflow: Action<HTMLDivElement, unknown> = (node) => {
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

<div
    class="table-with-scroll {classes}"
    style:border-radius={noStyles ? '0' : ''}
    class:u-margin-block-start-16={!noMargin}
    data-private>
    <div class="table-wrapper" use:hasOverflow={(v) => (isOverflowing = v)}>
        <table
            class="table"
            class:is-remove-outer-styles={noStyles}
            class:is-sticky-scroll={isSticky && isOverflowing}
            class:is-table-row-medium-size={dense}
            {style}
            style:--p-table-bg-color={transparent ? 'var(--transparent)' : ''}>
            <slot />
        </table>
    </div>
</div>

<script context="module" lang="ts">
    import { tick } from 'svelte';
    import { debounce } from '$lib/helpers/debounce';

    const batchQueue = new Set<() => void>();
    let batchPromise: Promise<void> | null = null;

    async function processBatch() {
        try {
            await tick();
            batchQueue.forEach((fn) => {
                try {
                    fn();
                } catch {
                    /* empty */
                }
            });
        } finally {
            // clear queue!
            batchQueue.clear();
            batchPromise = null;
        }
    }

    function addToBatch(fn: () => void) {
        batchQueue.add(fn);
        if (!batchPromise) {
            batchPromise = processBatch();
        }
    }

    export function truncateText(node: HTMLElement, text?: string) {
        let originalText = text ?? node.textContent;

        function checkOverflow() {
            node.textContent = originalText;

            if (node.scrollWidth > node.clientWidth) {
                let left = 0;
                let right = originalText.length;
                let bestFit = '…';

                while (left <= right) {
                    // total chars to keep
                    const keep = (left + right) >> 1;
                    const head = Math.ceil(keep / 2);
                    const tail = keep - head;
                    const truncated =
                        keep === originalText.length
                            ? originalText
                            : `${originalText.slice(0, head)}…${originalText.slice(-tail)}`;

                    node.textContent = truncated;

                    if (node.scrollWidth <= node.clientWidth) {
                        bestFit = truncated;
                        left = keep + 1;
                    } else {
                        right = keep - 1;
                    }
                }

                node.textContent = bestFit;
            }
        }

        const debouncedCheck = debounce(checkOverflow, 16);

        addToBatch(checkOverflow);
        window.addEventListener('resize', debouncedCheck);

        return {
            update(newText?: string) {
                originalText = newText ?? node.textContent;
                addToBatch(checkOverflow);
            },
            destroy() {
                batchQueue.delete(checkOverflow);
                window.removeEventListener('resize', debouncedCheck);
                debouncedCheck.cancel();
            }
        };
    }
</script>

<script lang="ts">
    import { Icon, Tag } from '@appwrite.io/pink-svelte';
    import { Copy } from '.';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import type { TooltipPlacement } from '$lib/components/copy.svelte';

    export let value: string;
    export let event: string = null;

    export let tooltipPortal = false;
    export let tooltipDelay: number = 0;
    export let tooltipPlacement: TooltipPlacement = undefined;
</script>

{#key value}
    <Copy {value} {event} {tooltipPortal} {tooltipDelay} {tooltipPlacement}>
        <Tag size="xs" variant="code">
            <Icon icon={IconDuplicate} size="s" slot="start" />
            <span
                style:white-space="nowrap"
                style:overflow="hidden"
                style:word-break="break-all"
                use:truncateText>
                <slot />
            </span>
        </Tag>
    </Copy>
{/key}

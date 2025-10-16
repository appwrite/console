<script module lang="ts">
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

    export function truncateId(id: string, head: number = 5, tail: number = 9): string {
        if (id.length <= head + tail) return id;
        return `${id.slice(0, head)}...${id.slice(-tail)}`;
    }

    export function truncateText(node: HTMLElement) {
        let originalText = node.textContent;

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
            update() {
                originalText = node.textContent;
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
    import { Copy } from '.';
    import type { Snippet } from 'svelte';
    import { Icon, Tag } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import type { TooltipPlacement } from '$lib/components/copy.svelte';

    const {
        value,
        event = null,
        tooltipPortal = false,
        tooltipDelay = 0,
        tooltipPlacement,
        children
    }: {
        value: string;
        event?: string | null;
        tooltipPortal?: boolean;
        tooltipDelay?: number;
        tooltipPlacement?: TooltipPlacement;
        truncate?: boolean;
        children: Snippet;
    } = $props();
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
                {@render children()}
            </span>
        </Tag>
    </Copy>
{/key}

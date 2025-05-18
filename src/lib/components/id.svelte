<script context="module" lang="ts">
    export function truncateText(node: HTMLElement) {
        const MAX_TRIES = 100;
        let originalText = node.textContent;
        function checkOverflow() {
            node.textContent = originalText;

            if (node.scrollWidth > node.clientWidth) {
                let truncatedText = originalText;
                let tries = 0;
                while (
                    node.scrollWidth > node.clientWidth &&
                    truncatedText.length > 0 &&
                    tries < MAX_TRIES
                ) {
                    tries++;
                    if (truncatedText.includes('…')) {
                        const [left, right] = truncatedText.split('…');
                        truncatedText = `${left.slice(0, -1)}…${right.slice(1)}`;
                    } else {
                        const left = truncatedText.slice(0, truncatedText.length / 2);
                        const right = truncatedText.slice(truncatedText.length / 2);
                        truncatedText = `${left.slice(0, -1)}…${right.slice(1)}`;
                    }
                    node.textContent = truncatedText;
                }
            }
        }
        requestAnimationFrame(checkOverflow);
        window.addEventListener('resize', checkOverflow);

        return {
            update() {
                originalText = node.textContent;
                checkOverflow();
            },
            destroy() {
                window.removeEventListener('resize', checkOverflow);
            }
        };
    }
</script>

<script lang="ts">
    import { Icon, Tag } from '@appwrite.io/pink-svelte';
    import { Copy } from '.';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';

    export let value: string;
    export let event: string = null;
</script>

<Copy {value} {event}>
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

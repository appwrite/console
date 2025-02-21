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
    import { Copy } from '.';

    export let value: string;
    export let event: string = null;
    export let centered = true;
</script>

<Copy {value} {event} appendTo="parent">
    <div
        class="interactive-text-output is-buttons-on-top"
        class:u-text-center={centered}
        style:min-inline-size="0"
        style:display="inline-flex">
        <span
            style:white-space="nowrap"
            class="text u-line-height-1-5"
            style:overflow="hidden"
            style:word-break="break-all"
            use:truncateText>
            <slot />
        </span>
        <div class="interactive-text-output-buttons">
            <button class="interactive-text-output-button is-hidden" aria-label="copy text">
                <span class="icon-duplicate" aria-hidden="true" />
            </button>
        </div>
    </div>
</Copy>

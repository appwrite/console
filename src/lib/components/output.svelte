<script lang="ts">
    import Copy from './copy.svelte';

    export let value: string;

    const MAX_TRIES = 100;
    function truncateText(node) {
        let originalText = node.textContent as string;

        function checkOverflow() {
            if (node.scrollWidth > node.clientWidth) {
                let truncatedText = originalText;
                let tries = 0;

                while (
                    node.scrollWidth > node.clientWidth &&
                    truncatedText.length > 0 &&
                    tries < MAX_TRIES
                ) {
                    tries++;

                    if (truncatedText.includes('...')) {
                        const [left, right] = truncatedText.split('...');
                        truncatedText = `${left.slice(0, -1)}...${right.slice(1)}`;
                    } else {
                        const left = truncatedText.slice(0, truncatedText.length / 2);
                        const right = truncatedText.slice(truncatedText.length / 2);
                        truncatedText = `${left.slice(0, -1)}...${right.slice(1)}`;
                    }

                    node.textContent = truncatedText;
                    // trigger reflow
                    node.offsetWidth;
                }
            } else {
                node.textContent = originalText;
            }
        }

        checkOverflow();
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

<Copy {value}>
    <div class="interactive-text-output is-textarea">
        <span class="text u-line-height-1-5" use:truncateText><slot /></span>

        <div class="u-flex u-cross-child-start u-gap-8">
            <button class="interactive-text-output-button" aria-label="copy text">
                <span class="icon-duplicate" aria-hidden="true" />
            </button>
        </div>
    </div>
</Copy>

<style>
    .text {
        white-space: nowrap;
        overflow: hidden;
    }
</style>

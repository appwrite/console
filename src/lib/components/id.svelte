<script lang="ts">
    import { Copy } from '.';

    export let value: string;
    export let event: string = null;

    let element: HTMLSpanElement;

    const isOverflowing = (elem: HTMLSpanElement, iterator = 1) => {
        let parent = elem?.parentElement;
        if (
            elem &&
            elem.scrollWidth + 10 >
                (parent.clientWidth ? parent.clientWidth : parent.parentElement.clientWidth)
        )
            trimText(iterator);
        else return;
    };

    function trimText(iterator: number) {
        if (iterator > 3) {
            element.childNodes[element.childElementCount].textContent = '…';
        } else {
            let text = element.childNodes[element.childElementCount].textContent;
            element.childNodes[element.childElementCount].textContent =
                '…' + text.slice(-14 + iterator * 2);
            isOverflowing(element, iterator + 1);
        }
    }

    $: isOverflowing(element);
</script>

<Copy {value} {event}>
    <div class="interactive-text-output" style:min-inline-size="0" style:display="inline-flex">
        <span style:white-space="nowrap" class="text u-line-height-1-5" bind:this={element}>
            <slot />
        </span>
        <div class="u-flex u-cross-child-start u-gap-8">
            <button class="interactive-text-output-button" aria-label="copy text">
                <span class="icon-duplicate" aria-hidden="true" />
            </button>
        </div>
    </div>
</Copy>

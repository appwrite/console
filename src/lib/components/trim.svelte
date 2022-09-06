<script lang="ts">
    import { onMount } from 'svelte';
    import tippy, { type PopperElement } from 'tippy.js';

    let data: HTMLSpanElement & Partial<PopperElement>;

    onMount(() => {
        setTooltip();
    });

    const setTooltip = () => {
        if (data.innerText) {
            const content = data.innerText;
            let tool = data?._tippy;

            if (data.offsetWidth < data.scrollWidth) {
                if (tool) {
                    tool.setContent(content);
                    tool.enable();
                } else {
                    tippy(data, { content });
                }
            } else {
                if (tool) {
                    tool.disable();
                }
            }
        }
    };

    const throttle = (fn: () => void, delay: number) => {
        let timeout = false;
        return () => {
            if (!timeout) {
                timeout = true;
                fn.apply(this);
                setTimeout(() => {
                    timeout = false;
                }, delay);
            }
        };
    };
</script>

<svelte:window on:resize={throttle(setTooltip, 250)} />

<span bind:this={data} class="text u-trim">
    <slot />
</span>

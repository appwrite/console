<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { onMount } from 'svelte';

    let data: HTMLSpanElement;

    onMount(() => {
        setTooltip();
    });

    const setTooltip = () => {
        if (data.innerText) {
            const content = data.innerText;
            const tool = tooltip(data, { content });
            tool.disable();
            if (data.offsetWidth < data.scrollWidth) {
                tool.enable();
            } else {
                tool.disable();
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

    //TODO: disable tooltip when text is with elipsis
</script>

<svelte:window on:resize={throttle(setTooltip, 50)} />

<span bind:this={data} class="text u-trim">
    <slot />
</span>

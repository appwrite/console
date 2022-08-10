<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';

    let data: HTMLSpanElement;
    $: content = data?.innerText;

    // TODO: enable tooltip only when there are elipsis
    // $: if (data?.offsetWidth < data?.scrollWidth) {
    // }
</script>

<span bind:this={data} class="text u-trim" use:tooltip={{ content, hideOnClick: false }}>
    <slot />
</span>

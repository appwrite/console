<script lang="ts">
    import { goto } from '$app/navigation';

    export let href: string;

    function goBack() {
        if (history.length > 1) {
            history.back();
        } else goto(href);
    }
</script>

<button on:click={() => goBack()}>
    <i class="icon-cheveron-left" />
    <slot />
</button>

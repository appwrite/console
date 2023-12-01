<script lang="ts">
    export let title = '';
    export let body = '';
</script>

<!-- TODO: Style to look like a push notification -->
<div class="phone card is-only-desktop">
    <p class="body-text-1 u-bold">{title}</p>
    <p class="body-text-2">{body}</p>
</div>

<style lang="scss">
    .phone {
        inline-size: calc(320 * 1rem / 16);
    }
</style>

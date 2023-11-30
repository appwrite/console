<script lang="ts">
    export let content = '';
</script>

<!-- TODO: Style to look like a phone -->
<div class="phone card is-only-desktop">
    {content}
</div>

<style lang="scss">
    .phone {
        inline-size: calc(320 * 1rem / 16);
    }
</style>

<script lang="ts">
    import { app } from '$lib/stores/app';
    import MongoDB from './mongo-db.svg';
    import MongoDBDark from './dark/mongo-db.svg';

    $: isDark = $app.themeInUse === 'dark';
    $: mongoDbImage = isDark ? MongoDBDark : MongoDB;
</script>

<!-- cannot use a tag as it has hover state which isn't needed here -->
<div class="custom-tag">
    <img src={mongoDbImage} alt="mongo-db artwork" style="width: 66px; height: 16px;" />
</div>

<style lang="scss">
    .custom-tag {
        display: flex;
        align-items: center;
        height: min-content;
        width: max-content;
        padding: var(--space-1, 2px) var(--space-3, 6px);

        border-radius: var(--border-radius-xs, 6px);
        background: var(--bgcolor-neutral-primary);
        border: var(--border-width-s, 1px) solid var(--border-neutral);
    }
</style>

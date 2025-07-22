<script lang="ts">
    import { isCsvImportInProgress } from './store';
    import { Tooltip } from '@appwrite.io/pink-svelte';
</script>

<Tooltip disabled={!$isCsvImportInProgress} maxWidth="12rem">
    <div>
        <slot />
    </div>

    <div slot="tooltip">This action is disabled during import.</div>
</Tooltip>

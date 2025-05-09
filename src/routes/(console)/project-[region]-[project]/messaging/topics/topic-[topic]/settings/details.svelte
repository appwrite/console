<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { topic, topicTotal } from '../store';
</script>

<CardGrid>
    <svelte:fragment slot="title">Details</svelte:fragment>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div data-private>
                <p class="title">{$topicTotal} subscriber{$topicTotal === 1 ? '' : 's'}</p>
                <p>Created: {toLocaleDateTime($topic.$createdAt)}</p>
            </div>
        </div>
    </svelte:fragment>
</CardGrid>

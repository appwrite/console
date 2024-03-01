<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { topic, topicTotal } from '../store';
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16" data-private>
        <Heading tag="h6" size="7">Details</Heading>
    </div>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div data-private>
                <p class="title">{$topicTotal} subscriber{$topicTotal === 1 ? '' : 's'}</p>
                <p>Created: {toLocaleDateTime($topic.$createdAt)}</p>
            </div>
        </div>
    </svelte:fragment>
</CardGrid>

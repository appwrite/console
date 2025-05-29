<script lang="ts">
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { Badge, Tooltip } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data: PageData;
    export let showCreate = false;
</script>

<CardContainer
    disableEmpty={!$canWriteBuckets}
    total={data.buckets.total}
    offset={data.offset}
    event="bucket"
    service="buckets"
    on:click={() => (showCreate = true)}>
    {#each data.buckets.buckets as bucket}
        <GridItem1 href={getProjectRoute(`/storage/bucket-${bucket.$id}`)}>
            <svelte:fragment slot="title">{bucket.name}</svelte:fragment>
            <svelte:fragment slot="status">
                {#if !bucket.enabled}
                    <div>
                        <Badge size="s" variant="secondary" content="Disabled" />
                    </div>
                {/if}
            </svelte:fragment>

            <Id value={bucket.$id}>{bucket.$id}</Id>

            <svelte:fragment slot="icons">
                <Tooltip>
                    <span
                        class:u-opacity-20={!bucket.encryption}
                        class="icon-lock-closed"
                        aria-hidden="true"></span>
                    <span slot="tooltip">
                        {bucket.encryption ? 'Encryption enabled' : 'Encryption disabled'}
                    </span>
                </Tooltip>
            </svelte:fragment>
        </GridItem1>
    {/each}
    <svelte:fragment slot="empty">
        <p>Create a bucket</p>
    </svelte:fragment>
</CardContainer>

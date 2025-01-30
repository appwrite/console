<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import Pill from '$lib/elements/pill.svelte';
    import { canWriteBuckets } from '$lib/stores/roles';
    import { Tooltip } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';

    export let data: PageData;
    export let showCreate = false;

    const project = $page.params.project;
</script>

<CardContainer
    showEmpty={$canWriteBuckets}
    total={data.buckets.total}
    offset={data.offset}
    event="bucket"
    service="buckets"
    on:click={() => (showCreate = true)}>
    {#each data.buckets.buckets as bucket}
        <GridItem1 href={`${base}/project-${project}/storage/bucket-${bucket.$id}`}>
            <svelte:fragment slot="title">{bucket.name}</svelte:fragment>
            <svelte:fragment slot="status">
                {#if !bucket.enabled}
                    <Pill>Disabled</Pill>
                {/if}
            </svelte:fragment>

            <Id value={bucket.$id}>{bucket.$id}</Id>

            <svelte:fragment slot="icons">
                <li>
                    <Tooltip>
                        <span
                            class:u-opacity-20={!bucket.encryption}
                            class="icon-lock-closed"
                            aria-hidden="true" />
                        <span slot="tooltip"
                            >{bucket.encryption
                                ? 'Encryption enabled'
                                : 'Encryption disabled'}</span>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip>
                        <span
                            class:u-opacity-20={!bucket.antivirus}
                            class="icon-shield-check"
                            aria-hidden="true" />
                        <span slot="tooltip"
                            >{bucket.antivirus ? 'Antivirus enabled' : 'Antivirus disabled'}</span>
                    </Tooltip>
                </li>
            </svelte:fragment>
        </GridItem1>
    {/each}
    <svelte:fragment slot="empty">
        <p>Create a bucket</p>
    </svelte:fragment>
</CardContainer>

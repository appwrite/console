<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import type { PageData } from './$types';
    export let data: PageData;
    export let showCreate = false;
    const project = $page.params.project;
</script>

<CardContainer total={data.buckets.total} on:click={() => (showCreate = true)} event="bucket">
    {#each data.buckets.buckets as bucket}
        <GridItem1 href={`${base}/console/project-${project}/storage/bucket-${bucket.$id}`}>
            <svelte:fragment slot="title">{bucket.name}</svelte:fragment>
            <Id value={bucket.$id}>{bucket.$id}</Id>

            <svelte:fragment slot="icons">
                <li>
                    <span
                        class:u-opacity-20={!bucket.encryption}
                        class="icon-lock-closed"
                        aria-hidden="true"
                        use:tooltip={{
                            content: bucket.encryption
                                ? 'Encryption enabled'
                                : 'Encryption disabled'
                        }} />
                </li>
                <li>
                    <span
                        class:u-opacity-20={!bucket.antivirus}
                        class="icon-shield-check"
                        aria-hidden="true"
                        use:tooltip={{
                            content: bucket.antivirus ? 'Antivirus enabled' : 'Antivirus disabled'
                        }} />
                </li>
            </svelte:fragment>
        </GridItem1>
    {/each}
    <svelte:fragment slot="empty">
        <p>Create a new bucket</p>
    </svelte:fragment>
</CardContainer>

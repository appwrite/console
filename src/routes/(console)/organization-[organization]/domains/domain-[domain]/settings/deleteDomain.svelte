<script lang="ts">
    import { BoxAvatar, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import Delete from '../../deleteDomainModal.svelte';

    export let domain: Models.Domain;
    let show = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete domain</svelte:fragment>
    Deleting this domain will remove the domain from all associated projects.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{domain.domain}</h6>
            </svelte:fragment>
            <p>Last updated: {toLocaleDateTime(domain.$updatedAt)}</p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (show = true)}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Delete bind:show selectedDomain={domain} />

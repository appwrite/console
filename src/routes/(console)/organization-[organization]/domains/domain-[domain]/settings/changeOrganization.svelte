<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button, InputSelect } from '$lib/elements/forms';
    import type { OrganizationList } from '$lib/stores/organization';
    import type { Models } from '@appwrite.io/console';

    export let domain: Models.ProxyRule;
    export let organizations: OrganizationList;
    let selectedOrg: string = null;

    async function moveDomain() {
        console.log(selectedOrg);
    }

    $: options = organizations.total
        ? organizations.teams.map((org) => ({ label: org.name, value: org.$id }))
        : [];
</script>

<CardGrid>
    <svelte:fragment slot="title">Change organization</svelte:fragment>
    Select an organization to move this domain. Project rules will remain unchanged to prevent disruptions.
    <svelte:fragment slot="aside">
        <InputSelect
            id="orgs"
            label="Move to"
            placeholder="Select destination"
            {options}
            bind:value={selectedOrg} />
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button on:click={moveDomain} disabled={!selectedOrg}>Move</Button>
    </svelte:fragment>
</CardGrid>

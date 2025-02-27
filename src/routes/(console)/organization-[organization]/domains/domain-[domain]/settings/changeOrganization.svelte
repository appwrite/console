<script lang="ts">
    import { page } from '$app/stores';
    import { CardGrid } from '$lib/components';
    import { Button, InputSelect } from '$lib/elements/forms';
    import type { OrganizationList } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export let domain: Models.Domain;
    export let organizations: OrganizationList;
    let selectedOrg: string = null;

    async function moveDomain() {
        try {
            await sdk.forConsole.domains.updateTeam(domain.$id, selectedOrg);
        } catch (error) {}
    }

    $: options = organizations.total
        ? organizations.teams
              .map((org) => ({ label: org.name, value: org.$id }))
              .filter((org) => org.value !== $page.params.organization)
        : [];
</script>

<CardGrid>
    <svelte:fragment slot="title">Change organization</svelte:fragment>
    Select an organization to move this domain. Project rules will remain unchanged to prevent disruptions.
    <svelte:fragment slot="aside">
        <InputSelect
            id="orgs"
            label="Move to"
            required
            placeholder="Select destination"
            disabled={options?.length === 0}
            {options}
            bind:value={selectedOrg} />
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button on:click={moveDomain} disabled={!selectedOrg}>Move</Button>
    </svelte:fragment>
</CardGrid>

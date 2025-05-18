<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSelect } from '$lib/elements/forms';
    import type { Domain } from '$lib/sdk/domains';
    import { addNotification } from '$lib/stores/notifications';
    import type { OrganizationList } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';

    export let domain: Domain;
    export let organizations: OrganizationList;
    let selectedOrg: string = null;

    async function moveDomain() {
        try {
            await sdk.forConsole.domains.updateTeam(domain.$id, selectedOrg);
            addNotification({
                type: 'success',
                message: 'Domain moved successfully'
            });
            await goto(`/console/organization-${selectedOrg}/domains/`);
            await invalidate(Dependencies.ORGANIZATION);
            await invalidate(Dependencies.DOMAINS);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    $: options = organizations.total
        ? organizations.teams
              .map((org) => ({ label: org.name, value: org.$id }))
              .filter((org) => org.value !== page.params.organization)
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
        <Button on:click={moveDomain} disabled={!selectedOrg || options?.length === 0}>Move</Button>
    </svelte:fragment>
</CardGrid>

<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Skeleton, Table } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';

    export let show = false;
    export let selectedPreset;
    let error = '';

    async function fetchPreset() {
        switch (selectedPreset.toLowerCase()) {
            //TODO: finish switch statement
            case 'zoho':
                return await sdk.forConsole.domains.getPresetZoho($page.params.domain);
        }
    }

    async function handleSubmit() {
        try {
            //TODO: create DNS records

            show = false;
            addNotification({
                type: 'success',
                message: `Preset has been added`
            });
            trackEvent(Submit.RecordCreate, {
                preset: selectedPreset
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.RecordCreate);
        }
    }

    $: console.log(selectedPreset);
</script>

<Modal
    title={`Add ${capitalize(selectedPreset)} DNS record`}
    bind:show
    bind:error
    onSubmit={handleSubmit}>
    <span slot="description">
        Forward emails to your domain using the following {capitalize(selectedPreset)} DNS records.
    </span>

    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Type</Table.Header.Cell>
            <Table.Header.Cell>Name</Table.Header.Cell>
            <Table.Header.Cell>Value</Table.Header.Cell>
            <Table.Header.Cell>TTL</Table.Header.Cell>
            <Table.Header.Cell>Priority</Table.Header.Cell>
        </svelte:fragment>
        {#await fetchPreset()}
            {#each Array(2) as _}
                <Table.Row>
                    {#each Array(5) as _}
                        <Table.Cell>
                            <Skeleton variant="line" width={70} height={15} />
                        </Table.Cell>
                    {/each}
                </Table.Row>
            {/each}
        {:then presetData}
            {JSON.stringify(presetData)}
            {#each presetData as record}
                <Table.Row>
                    <Table.Cell>{record.type}</Table.Cell>
                    <Table.Cell>{record.name}</Table.Cell>
                    <Table.Cell>{record.value}</Table.Cell>
                    <Table.Cell>{record.ttl}</Table.Cell>
                    <Table.Cell>{record.priority}</Table.Cell>
                </Table.Row>
            {/each}
        {/await}
    </Table.Root>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" submit>Add</Button>
    </svelte:fragment>
</Modal>

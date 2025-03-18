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

    <Table.Root columns={5} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Type</Table.Header.Cell>
            <Table.Header.Cell {root}>Name</Table.Header.Cell>
            <Table.Header.Cell {root}>Value</Table.Header.Cell>
            <Table.Header.Cell {root}>TTL</Table.Header.Cell>
            <Table.Header.Cell {root}>Priority</Table.Header.Cell>
        </svelte:fragment>
        {#await fetchPreset()}
            {#each Array(2) as _}
                <Table.Row.Base {root}>
                    {#each Array(5) as _}
                        <Table.Cell {root}>
                            <Skeleton variant="line" width={70} height={15} />
                        </Table.Cell>
                    {/each}
                </Table.Row.Base>
            {/each}
        {:then presetData}
            {JSON.stringify(presetData)}
            {#each presetData as record}
                <Table.Row.Base {root}>
                    <Table.Cell {root}>{record.type}</Table.Cell>
                    <Table.Cell {root}>{record.name}</Table.Cell>
                    <Table.Cell {root}>{record.value}</Table.Cell>
                    <Table.Cell {root}>{record.ttl}</Table.Cell>
                    <Table.Cell {root}>{record.priority}</Table.Cell>
                </Table.Row.Base>
            {/each}
        {/await}
    </Table.Root>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" submit>Add</Button>
    </svelte:fragment>
</Modal>

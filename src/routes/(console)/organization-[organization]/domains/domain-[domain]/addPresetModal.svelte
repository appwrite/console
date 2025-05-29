<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Skeleton, Table } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { presets } from './store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { createRecord } from '$lib/helpers/domains';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let selectedPreset: (typeof presets)[number];
    let records: Models.DnsRecordsList;
    let error = '';
    async function fetchPreset() {
        switch (selectedPreset.toLowerCase()) {
            case 'zoho':
                records = await sdk.forConsole.domains.getPresetZoho(page.params.domain);
                return records;
            case 'mailgun':
                records = await sdk.forConsole.domains.getPresetMailgun(page.params.domain);
                return records;
            case 'outlook':
                records = await sdk.forConsole.domains.getPresetOutlook(page.params.domain);
                return records;
            case 'proton mail':
                records = await sdk.forConsole.domains.getPresetProtonMail(page.params.domain);
                return records;
            case 'icloud':
                records = await sdk.forConsole.domains.getPresetICloud(page.params.domain);
                return records;
            case 'google workspace':
                records = await sdk.forConsole.domains.getPresetGoogleWorkspace(page.params.domain);
                return records;
        }
    }

    async function handleSubmit() {
        try {
            if (records.total) {
                const promises = records.dnsRecords.map(
                    async (record) => await createRecord(record, page.params.domain)
                );
                await Promise.all(promises);
            }
            invalidate(Dependencies.DOMAIN);
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
            {#each presetData.dnsRecords as record}
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

<script lang="ts">
    import {
        Button,
        InputNumber,
        InputSelect,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { Icon, Input, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { symmetricDifference } from '$lib/helpers/array';
    import { deepClone } from '$lib/helpers/object';
    import type { DnsRecord } from '$lib/sdk/domains';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { recordTypes } from './store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    // type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA' | 'PTR';

    export let show = false;
    export let selectedRecord: DnsRecord;

    let record = deepClone(selectedRecord);
    let error = '';

    async function handleSubmit() {
        try {
            //TODO: update DNS record
            switch (record.type) {
                case 'A':
                    await sdk.forConsole.domains.updateRecordA(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.comment
                    );

                    break;
                case 'AAAA':
                    await sdk.forConsole.domains.updateRecordAAAA(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.comment
                    );

                    break;
                case 'CNAME':
                    await sdk.forConsole.domains.updateRecordCNAME(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.comment
                    );

                    break;
                case 'MX':
                    await sdk.forConsole.domains.updateRecordMX(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.priority,
                        record.comment
                    );

                    break;
                case 'TXT':
                    await sdk.forConsole.domains.updateRecordTXT(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.comment
                    );

                    break;
                case 'NS':
                    await sdk.forConsole.domains.updateRecordNS(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.comment
                    );

                    break;

                case 'CAA':
                    await sdk.forConsole.domains.updateRecordCAA(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.comment
                    );

                    break;
                case 'HTTPS':
                    await sdk.forConsole.domains.updateRecordHTTPS(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.comment
                    );

                    break;
                case 'ALIAS':
                    await sdk.forConsole.domains.updateRecordAlias(
                        $page.params.domain,
                        record.$id,
                        record.name,
                        record.value,
                        record.ttl,
                        record.comment
                    );

                    break;

                default:
                    break;
            }
            show = false;
            invalidate(Dependencies.DOMAINS);
            addNotification({
                type: 'success',
                message: `Record has been updated`
            });
            trackEvent(Submit.RecordUpdate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.RecordUpdate);
        }
    }

    $: if (!show) {
        selectedRecord = null;
    }

    $: isDisabled = !symmetricDifference(Object.values(record), Object.values(selectedRecord))
        ?.length;
</script>

<Modal title="Update DNS record" bind:show bind:error onSubmit={handleSubmit}>
    <span slot="description">
        DNS records map domain names to IP addresses or other resources.
    </span>
    <Layout.Stack gap="l">
        <InputText
            id="name"
            required
            label="Name"
            placeholder="subdomain"
            bind:value={record.name} />
        <Layout.Stack gap="xs">
            <InputSelect options={recordTypes} bind:value={record.type} id="type" label="Type" />
            <Input.Helper state="default">
                {recordTypes.find((option) => option.value === record.type)?.helper}
            </Input.Helper>
        </Layout.Stack>

        <InputText id="value" label="Value" placeholder="76.75.21.21" bind:value={record.value}>
            <Tooltip slot="info">
                <Icon icon={IconInfo} size="s" />
                <span slot="tooltip">
                    {recordTypes.find((option) => option.value === record.type)?.helper}
                </span>
            </Tooltip>
        </InputText>
        <Layout.Stack direction="row" gap="l">
            <InputNumber id="ttl" label="TTL" placeholder="Enter number" bind:value={record.ttl}>
                <Tooltip slot="info">
                    <Icon icon={IconInfo} size="s" />
                    <span slot="tooltip">
                        TTL defines how long DNS information is cached. Lower values update faster;
                        higher values reduce server load.
                    </span>
                </Tooltip>
            </InputNumber>
            <InputNumber
                id="priority"
                label="Priority"
                placeholder="Enter number"
                bind:value={record.priority}>
                <Tooltip slot="info">
                    <Icon icon={IconInfo} size="s" />
                    <span slot="tooltip">
                        Sets the priority for this DNS record. Lower numbers indicate higher
                        priority (e.g., 10 is higher than 20).
                    </span>
                </Tooltip>
            </InputNumber>
        </Layout.Stack>

        <InputTextarea
            id="comment"
            label="Comment"
            placeholder="Provide an explanation of this DNS record's purpose"
            bind:value={record.comment} />
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isDisabled}>Update</Button>
    </svelte:fragment>
</Modal>

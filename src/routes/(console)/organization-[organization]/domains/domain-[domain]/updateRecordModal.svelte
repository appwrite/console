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
    import { page } from '$app/state';
    import { recordTypes } from './store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import type { RecordType } from '$lib/stores/domains';
    import { updateRecord } from '$lib/helpers/domains';

    export let show = false;
    export let selectedRecord: Models.DnsRecord;

    let record = deepClone(selectedRecord);
    let error = '';

    const placeholders: Record<RecordType, string> = {
        A: '76.75.21.21',
        AAAA: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        CNAME: 'stage.example.com',
        MX: 'mail.example.com',
        TXT: 'v=spf1 include:_spf.example.com ~all',
        NS: 'ns1.example.com',
        SRV: '10 5 8080 example.com',
        CAA: '0 issue "letsencrypt.org"',
        HTTPS: 'https://example.com',
        ALIAS: 'www.example.com'
    };
    $: placeholder = placeholders[record.type] ?? 'Enter value';

    async function handleSubmit() {
        try {
            await updateRecord(record, page.params.domain);
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

    $: showPriority =
        record.name.toLocaleLowerCase() === 'mx' || record.name.toLocaleLowerCase() === 'srv';
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

        <InputText id="value" label="Value" {placeholder} bind:value={record.value}>
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
            {#if showPriority}
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
            {/if}
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

<script lang="ts">
    import {
        Button,
        InputNumber,
        InputSelect,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { Icon, Layout, Tooltip, Input } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { recordTypes } from './store';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';

    type RecordType =
        | 'A'
        | 'AAAA'
        | 'CNAME'
        | 'MX'
        | 'TXT'
        | 'NS'
        | 'SRV'
        | 'CAA'
        | 'PTR'
        | 'HTTPS'
        | 'ALIAS';

    export let show = false;

    let name: string;
    let type: RecordType = 'A';
    let value: string;
    let ttl = 3600;
    let priority: number;
    let comment: string;
    let error = '';

    async function handleSubmit() {
        try {
            switch (type) {
                case 'A':
                    await sdk.forConsole.domains.createRecordA(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        comment || undefined
                    );

                    break;
                case 'AAAA':
                    await sdk.forConsole.domains.createRecordAAAA(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        comment || undefined
                    );

                    break;
                case 'CNAME':
                    await sdk.forConsole.domains.createRecordCNAME(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        comment || undefined
                    );

                    break;
                case 'MX':
                    await sdk.forConsole.domains.createRecordMX(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        priority,
                        comment || undefined
                    );

                    break;
                case 'TXT':
                    await sdk.forConsole.domains.createRecordTXT(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        comment || undefined
                    );

                    break;
                case 'NS':
                    await sdk.forConsole.domains.createRecordNS(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        comment || undefined
                    );

                    break;

                case 'CAA':
                    await sdk.forConsole.domains.createRecordCAA(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        comment || undefined
                    );

                    break;
                case 'HTTPS':
                    await sdk.forConsole.domains.createRecordHTTPS(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        comment || undefined
                    );

                    break;
                case 'ALIAS':
                    await sdk.forConsole.domains.createRecordAlias(
                        $page.params.domain,
                        name,
                        value,
                        ttl,
                        comment || undefined
                    );

                    break;

                default:
                    break;
            }

            show = false;
            invalidate(Dependencies.DOMAINS);
            addNotification({
                type: 'success',
                message: `Record has been created`
            });
            trackEvent(Submit.RecordCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.RecordCreate);
        }
    }
</script>

<Modal title="Create DNS record" bind:show bind:error onSubmit={handleSubmit}>
    <span slot="description">
        DNS records map domain names to IP addresses or other resources.
    </span>
    <Layout.Stack gap="l">
        <InputText id="name" label="Name" placeholder="subdomain" bind:value={name} required />
        <Layout.Stack gap="xs">
            <InputSelect options={recordTypes} bind:value={type} id="type" label="Type" required />
            <Input.Helper state="default">
                {recordTypes.find((option) => option.value === type)?.helper}
            </Input.Helper>
        </Layout.Stack>

        <InputText id="value" label="Value" placeholder="76.75.21.21" bind:value>
            <Tooltip slot="info">
                <Icon icon={IconInfo} size="s" />
                <span slot="tooltip">
                    Enter the target or destination for this DNS record (e.g., IP address, hostname,
                    or other required data)
                </span>
            </Tooltip>
        </InputText>
        <Layout.Stack direction="row" gap="l">
            <InputNumber id="ttl" label="TTL" placeholder="Enter number" bind:value={ttl}>
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
                bind:value={priority}>
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
            bind:value={comment} />
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>

<script lang="ts">
    import {
        Button,
        InputNumber,
        InputSelect,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { Icon, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import { symmetricDifference } from '$lib/helpers/array';
    import { deepClone } from '$lib/helpers/object';

    // type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA' | 'PTR';

    export let show = false;
    export let selectedRecord: Models.DnsRecord;
    const options = [
        {
            value: 'A',
            label: 'A ',
            helper: 'A records map a domain to an IPv4 address, allowing browsers to find your website by translating the domain name to an IP address.'
        },
        {
            value: 'AAAA',
            label: 'AAAA ',
            helper: 'AAAA records map a domain to an IPv6 address, providing the same function as A records but for IPv6-enabled devices.'
        },
        {
            value: 'CNAME',
            label: 'CNAME',
            helper: 'CNAME records alias one domain name to another, allowing you to point subdomains or other domain names to an existing domain.'
        },
        {
            value: 'MX',
            label: 'MX ',
            helper: 'MX records specify mail servers responsible for receiving emails for a domain, helping route email traffic to the correct mail server.'
        },
        {
            value: 'TXT',
            label: 'TXT',
            helper: 'TXT records store arbitrary text data in DNS, commonly used for verification purposes, such as domain ownership or email security settings.'
        },
        {
            value: 'NS',
            label: 'NS',
            helper: "NS records define the authoritative DNS servers for a domain, directing queries to the servers that manage the domain's DNS settings."
        },
        {
            value: 'SRV',
            label: 'SRV',
            helper: 'SRV records specify the location (hostname and port number) of servers for specific services, directing traffic to particular servers based on service types.'
        },
        {
            value: 'CAA',
            label: 'CAA',
            helper: 'CAA records specify which certificate authorities are allowed to issue SSL certificates for your domain, helping to prevent unauthorized certificate issuance.'
        },
        {
            value: 'HTTPS',
            label: 'HTTPS',
            helper: 'HTTPS records define which service or endpoint handles secure HTTPS traffic for your domain, typically used in SSL/TLS configurations.'
        },
        {
            value: 'ALIAS',
            label: 'ALIAS',
            helper: 'ALIAS records are similar to CNAMEs but can be used for the root domain, allowing you to point your domain to another domain or server.'
        }
    ];
    let record = deepClone(selectedRecord);
    let error = '';

    async function handleSubmit() {
        try {
            //TODO: update DNS record

            show = false;
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
        <InputText id="name" label="Name" placeholder="subdomain" bind:value={record.name} />
        <Layout.Stack gap="xs">
            <InputSelect {options} bind:value={record.type} id="type" label="Type" />
            <Layout.Stack direction="row" gap="xs">
                <Icon icon={IconInfo} />
            </Layout.Stack>
        </Layout.Stack>

        <InputText id="value" label="Value" placeholder="76.75.21.21" bind:value={record.value}>
            <Tooltip slot="info">
                <Icon icon={IconInfo} />
                <span slot="tooltip">
                    {options.find((option) => option.value === record.type)?.helper}
                </span>
            </Tooltip>
        </InputText>
        <Layout.Stack direction="row" gap="l">
            <InputNumber id="ttl" label="TTL" placeholder="Enter number" bind:value={record.ttl}>
                <Tooltip slot="info">
                    <Icon icon={IconInfo} />
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
                    <Icon icon={IconInfo} />
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
        <Button secondary submit disabled={isDisabled}>Update DNS record</Button>
    </svelte:fragment>
</Modal>

<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { removeFile } from '$lib/helpers/files';
    import { sdk } from '$lib/stores/sdk';
    import type { DnsRecord } from '$lib/sdk/domains';
    import { page } from '$app/stores';

    export let show = false;
    let files: FileList;
    let error = '';

    type ParsedRecords = {
        A: Partial<DnsRecord>[];
        AAAA: Partial<DnsRecord>[];
        CNAME: Partial<DnsRecord>[];
        MX: Partial<DnsRecord>[];
        TXT: Partial<DnsRecord>[];
        NS: Partial<DnsRecord>[];
        SRV: Partial<DnsRecord>[];
        CAA: Partial<DnsRecord>[];
        PTR: Partial<DnsRecord>[];
        HTTPS: Partial<DnsRecord>[];
        ALIAS: Partial<DnsRecord>[];
        [key: string]: Partial<DnsRecord>[];
    };

    function parseZoneFile(content: string): ParsedRecords {
        const records: ParsedRecords = {
            A: [],
            AAAA: [],
            CNAME: [],
            MX: [],
            TXT: [],
            NS: [],
            SRV: [],
            CAA: [],
            PTR: [],
            HTTPS: [],
            ALIAS: []
        };

        // Split the content into lines and process each line
        const lines = content.split('\n');

        for (let line of lines) {
            // Remove comments, but save them for record comment field
            let comment = '';
            const commentIndex = line.indexOf(';');
            if (commentIndex !== -1) {
                comment = line.substring(commentIndex + 1).trim();
                line = line.substring(0, commentIndex).trim();
            }

            // Skip empty lines or pure comment lines
            if (!line.trim()) continue;

            // Split line into parts (whitespace separated)
            const parts = line.trim().split(/\s+/);

            // Need at least a name, TTL/class/type, and value
            if (parts.length < 3) continue;

            let recordType = '';
            let name = '';
            let value = '';
            let ttl = 3600;
            let priority: number | undefined;
            let weight: number | undefined;
            let port: number | undefined;

            // Try to determine the record type from the parts
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i].toUpperCase();
                if (['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'].includes(part)) {
                    recordType = part;
                    name = parts[0] === '@' ? '' : parts[0]; // @ represents the domain itself

                    // Handle TTL if it appears to be a number
                    const possibleTtl = parseInt(parts[i - 1]);
                    if (!isNaN(possibleTtl) && i > 0) {
                        ttl = possibleTtl;
                    }

                    if (recordType === 'MX' && i + 2 < parts.length) {
                        priority = parseInt(parts[i + 1]);
                        value = parts[i + 2];
                    } else if (recordType === 'SRV' && i + 4 < parts.length) {
                        priority = parseInt(parts[i + 1]);
                        weight = parseInt(parts[i + 2]);
                        port = parseInt(parts[i + 3]);
                        value = parts[i + 4];
                    } else if (i + 1 < parts.length) {
                        value = parts.slice(i + 1).join(' ');
                    }

                    break;
                }
            }

            if (recordType && value) {
                if (recordType === 'TXT' && value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }

                const record: Partial<DnsRecord> = {
                    name,
                    value,
                    ttl,
                    comment: comment || undefined
                };

                if (priority !== undefined) {
                    record.priority = priority;
                }

                if (!records[recordType]) {
                    records[recordType] = [];
                }

                records[recordType].push(record);
            }
        }

        return records;
    }

    async function handleSubmit() {
        try {
            if (!files?.length) return;

            const file = files[0];
            const content = await file.text();
            const parsedRecords = parseZoneFile(content);

            let recordCount = 0;

            for (const [type, records] of Object.entries(parsedRecords)) {
                recordCount += records.length;

                for (const record of records) {
                    switch (type) {
                        case 'A':
                            await sdk.forConsole.domains.createRecordA(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.comment
                            );
                            break;
                        case 'AAAA':
                            await sdk.forConsole.domains.createRecordAAAA(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.comment
                            );
                            break;
                        case 'CNAME':
                            await sdk.forConsole.domains.createRecordCNAME(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.comment
                            );
                            break;
                        case 'MX':
                            await sdk.forConsole.domains.createRecordMX(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.priority || 10,
                                record.ttl,
                                record.comment
                            );
                            break;
                        case 'TXT':
                            await sdk.forConsole.domains.createRecordTXT(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.comment
                            );
                            break;
                        case 'NS':
                            await sdk.forConsole.domains.createRecordNS(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.comment
                            );
                            break;
                        case 'SRV':
                            await sdk.forConsole.domains.createRecordSRV(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.priority,
                                record.weight,
                                record.port,
                                record.comment
                            );
                            break;
                        case 'CAA':
                            await sdk.forConsole.domains.createRecordCAA(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.comment
                            );
                            break;
                        case 'PTR':
                            await sdk.forConsole.domains.createRecordHTTPS(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.comment
                            );
                            break;
                        case 'ALIAS':
                            await sdk.forConsole.domains.createRecordAlias(
                                $page.params.domain,
                                record.name,
                                record.value,
                                record.ttl,
                                record.comment
                            );
                            break;
                    }
                }
            }

            show = false;
            addNotification({
                type: 'success',
                message: `${recordCount} DNS records have been imported successfully`
            });
            trackEvent(Submit.RecordCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.RecordCreate);
        }
    }

    $: filesList = files?.length
        ? Array.from(files).map((file) => {
              let f = file as Partial<File> & { removable: boolean };
              f.removable = true;
              return f;
          })
        : [];
</script>

<Modal title="Import zone file" bind:show bind:error onSubmit={handleSubmit}>
    <span slot="description">
        Import DNS zone file to apply its records to your domain. <b
            >If conflicts arise, the upload will be blocked</b
        >.
    </span>

    <Layout.Stack gap="xl">
        <Layout.Stack gap="s">
            <Typography.Text color="--fgcolor-neutral-primary">
                Upload a .txt file with your DNS records
            </Typography.Text>
            <Upload.Dropzone bind:files extensions={['txt']}>
                <Layout.Stack alignItems="center" gap="s">
                    <Layout.Stack alignItems="center" gap="s">
                        <Layout.Stack
                            alignItems="center"
                            justifyContent="center"
                            direction="row"
                            gap="s">
                            <Typography.Text variant="l-500">
                                Drag and drop file here or click to upload
                            </Typography.Text>
                            <Tooltip>
                                <Layout.Stack alignItems="center" justifyContent="center" inline>
                                    <Icon icon={IconInfo} size="s" />
                                </Layout.Stack>
                                <svelte:fragment slot="tooltip"
                                    >Only .txt files allowed</svelte:fragment>
                            </Tooltip>
                        </Layout.Stack>
                        <Typography.Caption variant="400">Max file size 10MB</Typography.Caption>
                    </Layout.Stack>
                </Layout.Stack>
            </Upload.Dropzone>
        </Layout.Stack>
        {#if files?.length}
            <Upload.List
                bind:files={filesList}
                on:remove={(e) => (files = removeFile(e.detail, files))} />
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" submit disabled={!files?.length}>Import</Button>
    </svelte:fragment>
</Modal>

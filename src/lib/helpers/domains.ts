import { sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';

export async function createRecord(record: Partial<Models.DnsRecord>, domainId: string) {
    switch (record.type) {
        case 'A':
            return await sdk.forConsole.domains.createRecordA({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record?.comment || undefined
            });
        case 'AAAA':
            return await sdk.forConsole.domains.createRecordAAAA({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record?.comment || undefined
            });
        case 'CNAME':
            return await sdk.forConsole.domains.createRecordCNAME({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record?.comment || undefined
            });
        case 'MX':
            return await sdk.forConsole.domains.createRecordMX({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                priority: record.priority || 10,
                comment: record?.comment || undefined
            });
        case 'TXT':
            return await sdk.forConsole.domains.createRecordTXT({
                domainId,
                name: record.name!,
                ttl: record.ttl!,
                value: record.value!,
                comment: record?.comment || undefined
            });
        case 'NS':
            return await sdk.forConsole.domains.createRecordNS({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record?.comment || undefined
            });
        case 'SRV':
            return await sdk.forConsole.domains.createRecordSRV({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                priority: record.priority!,
                weight: record.weight!,
                port: record.port!,
                comment: record?.comment || undefined
            });
        case 'CAA':
            return await sdk.forConsole.domains.createRecordCAA({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record?.comment || undefined
            });
        case 'HTTPS':
            return await sdk.forConsole.domains.createRecordHTTPS({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record?.comment || undefined
            });
        case 'ALIAS':
            return await sdk.forConsole.domains.createRecordAlias({
                domainId,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record?.comment || undefined
            });
    }
}

export async function updateRecord(record: Partial<Models.DnsRecord>, domainId: string) {
    switch (record.type) {
        case 'A':
            return await sdk.forConsole.domains.updateRecordA({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record.comment || undefined
            });
        case 'AAAA':
            return await sdk.forConsole.domains.updateRecordAAAA({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record.comment || undefined
            });
        case 'CNAME':
            return await sdk.forConsole.domains.updateRecordCNAME({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record.comment || undefined
            });
        case 'MX':
            return await sdk.forConsole.domains.updateRecordMX({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                priority: record.priority!,
                comment: record.comment || undefined
            });
        case 'TXT':
            return await sdk.forConsole.domains.updateRecordTXT({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record.comment || undefined
            });
        case 'NS':
            return await sdk.forConsole.domains.updateRecordNS({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record.comment || undefined
            });
        case 'SRV':
            return await sdk.forConsole.domains.updateRecordSRV({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                priority: record.priority!,
                weight: record.weight!,
                port: record.port!,
                comment: record.comment || undefined
            });
        case 'CAA':
            return await sdk.forConsole.domains.updateRecordCAA({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record.comment || undefined
            });
        case 'HTTPS':
            return await sdk.forConsole.domains.updateRecordHTTPS({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record.comment || undefined
            });
        case 'ALIAS':
            return await sdk.forConsole.domains.updateRecordAlias({
                domainId,
                recordId: record.$id!,
                name: record.name!,
                value: record.value!,
                ttl: record.ttl!,
                comment: record.comment || undefined
            });
    }
}

export type ParsedRecords = {
    A: Partial<Models.DnsRecord>[];
    AAAA: Partial<Models.DnsRecord>[];
    CNAME: Partial<Models.DnsRecord>[];
    MX: Partial<Models.DnsRecord>[];
    TXT: Partial<Models.DnsRecord>[];
    NS: Partial<Models.DnsRecord>[];
    SRV: Partial<Models.DnsRecord>[];
    CAA: Partial<Models.DnsRecord>[];
    PTR: Partial<Models.DnsRecord>[];
    HTTPS: Partial<Models.DnsRecord>[];
    ALIAS: Partial<Models.DnsRecord>[];
    [key: string]: Partial<Models.DnsRecord>[];
};

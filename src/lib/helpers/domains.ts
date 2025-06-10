import { sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';

export async function createRecord(record: Partial<Models.DnsRecord>, domainId: string) {
    switch (record.type) {
        case 'A':
            return await sdk.forConsole.domains.createRecordA(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record?.comment || undefined
            );
        case 'AAAA':
            return await sdk.forConsole.domains.createRecordAAAA(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record?.comment || undefined
            );
        case 'CNAME':
            return await sdk.forConsole.domains.createRecordCNAME(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record?.comment || undefined
            );
        case 'MX':
            return await sdk.forConsole.domains.createRecordMX(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record.priority || 10,
                record?.comment || undefined
            );
        case 'TXT':
            return await sdk.forConsole.domains.createRecordTXT(
                domainId,
                record.name,
                record.ttl,
                record.value,
                record?.comment || undefined
            );
        case 'NS':
            return await sdk.forConsole.domains.createRecordNS(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record?.comment || undefined
            );
        case 'SRV':
            return await sdk.forConsole.domains.createRecordSRV(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record.priority,
                record.weight,
                record.port,
                record?.comment || undefined
            );
        case 'CAA':
            return await sdk.forConsole.domains.createRecordCAA(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record?.comment || undefined
            );
        case 'HTTPS':
            return await sdk.forConsole.domains.createRecordHTTPS(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record?.comment || undefined
            );
        case 'ALIAS':
            return await sdk.forConsole.domains.createRecordAlias(
                domainId,
                record.name,
                record.value,
                record.ttl,
                record?.comment || undefined
            );
    }
}

export async function updateRecord(record: Partial<Models.DnsRecord>, domainId: string) {
    switch (record.type) {
        case 'A':
            return await sdk.forConsole.domains.updateRecordA(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.comment
            );
        case 'AAAA':
            return await sdk.forConsole.domains.updateRecordAAAA(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.comment
            );
        case 'CNAME':
            return await sdk.forConsole.domains.updateRecordCNAME(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.comment
            );
        case 'MX':
            return await sdk.forConsole.domains.updateRecordMX(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.priority,
                record.comment
            );
        case 'TXT':
            return await sdk.forConsole.domains.updateRecordTXT(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.comment
            );
        case 'NS':
            return await sdk.forConsole.domains.updateRecordNS(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.comment
            );
        case 'SRV':
            return await sdk.forConsole.domains.updateRecordSRV(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.priority,
                record.weight,
                record.port,
                record?.comment || undefined
            );
        case 'CAA':
            return await sdk.forConsole.domains.updateRecordCAA(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.comment
            );
        case 'HTTPS':
            return await sdk.forConsole.domains.updateRecordHTTPS(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.comment
            );
        case 'ALIAS':
            return await sdk.forConsole.domains.updateRecordAlias(
                domainId,
                record.$id,
                record.name,
                record.value,
                record.ttl,
                record.comment
            );
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

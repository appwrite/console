import type { DnsRecord } from '$lib/sdk/domains';
import { sdk } from '$lib/stores/sdk';

export async function createRecord(record: Partial<DnsRecord>, domainId: string) {
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
                record.priority || 10,
                record.ttl,
                record?.comment || undefined
            );
        case 'TXT':
            return await sdk.forConsole.domains.createRecordTXT(
                domainId,
                record.name,
                record.value,
                record.ttl,
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

export type ParsedRecords = {
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

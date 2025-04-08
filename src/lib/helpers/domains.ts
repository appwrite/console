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

/**
 * Parse DNS zone file content and extract DNS records
 * @param content Zone file content as string
 * @returns Object with arrays of records grouped by type
 */
export function parseDnsRecords(content: string): Record<string, Partial<DnsRecord>[]> {
    // Initialize records object with empty arrays for each record type
    const records: Record<string, Partial<DnsRecord>[]> = {
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

    if (!content || content.trim() === '') {
        return records;
    }

    // Default TTL value
    let defaultTTL = 3600;
    // Origin for the zone
    let origin = '';

    // Process the content line by line
    const lines = content.split('\n');

    // Process each line
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Skip empty lines
        if (line === '') continue;

        // Skip comment lines
        if (line.startsWith(';')) continue;

        // Skip newline characters
        if (line === '\n') continue;

        // Remove inline comments
        const commentIndex = line.indexOf(';');
        if (commentIndex !== -1) {
            line = line.substring(0, commentIndex).trim();
        }

        // Handle directives
        if (line.startsWith('$')) {
            if (line.startsWith('$ORIGIN')) {
                origin = line.split(/\s+/)[1].replace(/\.$/, '');
            } else if (line.startsWith('$TTL')) {
                defaultTTL = parseInt(line.split(/\s+/)[1], 10);
            }
            continue;
        }

        // Skip SOA record which spans multiple lines
        if (line.includes('SOA') || line.includes('(')) {
            // Skip until we find the closing parenthesis
            while (i < lines.length && !lines[i].includes(')')) {
                i++;
            }
            // Skip one more line if it contains the closing parenthesis
            if (i < lines.length && lines[i].includes(')')) {
                continue;
            }
        }

        // Parse the record
        try {
            const record = parseLine(line, defaultTTL, origin, Object.keys(records));
            if (record && record.type && records[record.type]) {
                records[record.type].push(record);
            }
        } catch (error) {
            console.error('Error parsing line:', line, error);
        }
    }

    return records;
}

/**
 * Parse a single line from a zone file
 * @param line Line to parse
 * @param defaultTTL Default TTL value
 * @param origin Domain origin
 * @param validTypes Array of valid record types
 * @returns Parsed DNS record
 */
function parseLine(
    line: string,
    defaultTTL: number,
    origin: string,
    validTypes: string[]
): Partial<DnsRecord> | null {
    // Skip invalid lines
    if (!line || line.trim() === '') return null;

    // Split the line by whitespace, preserving quoted strings
    const parts: string[] = [];
    let currentPart = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
            inQuotes = !inQuotes;
            currentPart += char;
        } else if (!inQuotes && /\s/.test(char)) {
            if (currentPart) {
                parts.push(currentPart);
                currentPart = '';
            }
        } else {
            currentPart += char;
        }
    }

    if (currentPart) {
        parts.push(currentPart);
    }

    // Filter out empty parts
    const filteredParts = parts.filter((part) => part !== '');
    if (filteredParts.length < 2) return null;

    let recordName = filteredParts[0];
    let type = '';
    let value = '';
    let ttl = defaultTTL;
    let priority = 0;
    let position = 1;

    // Handle special case for entries starting with IN (for complex zone file with multiple servers)
    if (recordName === 'IN') {
        recordName = '';
    }

    // Clean trailing dots from domain names
    recordName = recordName.replace(/\.$/, '');

    // Check if the second part is a TTL
    if (/^\d+$/.test(filteredParts[position])) {
        ttl = parseInt(filteredParts[position], 10);
        position++;
    }

    // Check if the next part is the record class (IN)
    if (filteredParts[position] === 'IN') {
        position++;
    }

    // Get the record type
    if (position < filteredParts.length) {
        type = filteredParts[position].toUpperCase();
        position++;
    }

    // Ensure we have a valid record type
    if (!type || !validTypes.includes(type)) {
        return null;
    }

    // Handle MX records which have priority
    if (type === 'MX' && position < filteredParts.length) {
        priority = parseInt(filteredParts[position], 10);
        position++;
    }

    // Get the record value
    if (position < filteredParts.length) {
        // For quoted strings, remove the quotes
        let recordValue = filteredParts[position];
        if (recordValue.startsWith('"') && recordValue.endsWith('"')) {
            recordValue = recordValue.substring(1, recordValue.length - 1);
        }

        // Remove trailing dot for domain names
        value = recordValue.replace(/\.$/, '');
    }

    // Create and return the record
    return {
        type,
        name: recordName,
        value,
        ttl,
        priority,
        weight: 0,
        port: 0,
        comment: ''
    };
}

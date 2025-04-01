import type { DnsRecord } from '$lib/sdk/domains';

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

export function parseDnsRecords(content: string): ParsedRecords {
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

    // If content is empty, return empty records
    if (!content) {
        return records;
    }

    // Split the file into lines and process each line
    const lines = content.split('\n');
    // Track origin for domain context
    let origin = '';

    for (let line of lines) {
        // Skip empty lines and comments
        line = line.trim();
        if (line === '' || line.startsWith(';') || line.startsWith('$')) {
            // Check for origin directive
            if (line.startsWith('$ORIGIN')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 2) {
                    origin = parts[1];
                    // Remove trailing dot if present
                    if (origin.endsWith('.')) {
                        origin = origin.slice(0, -1);
                    }
                }
            }
            continue;
        }

        // Skip SOA records
        if (line.includes('SOA') || line.match(/^\s*\d+\s*$/)) {
            continue;
        }

        try {
            // Parse the line into tokens, handling quoted values
            const tokens: string[] = [];
            let currentToken = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                    inQuotes = !inQuotes;
                    currentToken += char;
                } else if (!inQuotes && (char === ' ' || char === '\t') && currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                    // Skip multiple spaces/tabs
                    while (i + 1 < line.length && (line[i + 1] === ' ' || line[i + 1] === '\t')) {
                        i++;
                    }
                } else {
                    currentToken += char;
                }
            }

            if (currentToken) {
                tokens.push(currentToken);
            }

            if (tokens.length < 3) {
                continue; // Not enough tokens for a valid record
            }

            // Find the type index - look for "IN" class and the type after it
            let typeIndex = -1;
            let type = '';
            let inIndex = -1; // Track position of IN class marker
            const validTypes = [
                'A',
                'AAAA',
                'CNAME',
                'MX',
                'TXT',
                'NS',
                'SRV',
                'CAA',
                'PTR',
                'HTTPS',
                'ALIAS'
            ];

            // First look for IN class followed by record type
            for (let i = 0; i < tokens.length - 1; i++) {
                if (tokens[i].toUpperCase() === 'IN') {
                    inIndex = i;
                    if (validTypes.includes(tokens[i + 1].toUpperCase())) {
                        typeIndex = i + 1;
                        type = tokens[i + 1].toUpperCase();
                        break;
                    }
                }
            }

            // If we didn't find it that way, check for standalone record types
            if (typeIndex === -1) {
                for (let i = 0; i < tokens.length; i++) {
                    const token = tokens[i].toUpperCase();
                    if (validTypes.includes(token)) {
                        typeIndex = i;
                        type = token;
                        break;
                    }
                }
            }

            if (typeIndex === -1 || !type) {
                continue; // No valid record type found
            }

            // Parse name
            let name = tokens[0];

            // Handle @ symbol for root domain or empty for the domain itself
            if (name === '@') {
                name = '';
            }

            // Check if name is the same as origin (with or without trailing dot)
            const normalizedName = name.endsWith('.') ? name.slice(0, -1) : name;
            if (normalizedName === origin) {
                name = '';
            }
            // For names that end with the origin, extract just the subdomain part
            else if (origin && normalizedName.endsWith(origin) && normalizedName !== origin) {
                // Handle case like "ns.example.com" where origin is "example.com"
                // We want to extract just "ns"
                const subdomain = normalizedName.slice(0, -(origin.length + 1)); // +1 for the dot
                if (subdomain) {
                    name = subdomain;
                }
            }
            // Remove domain suffix if present (for absolute names ending with a dot)
            else if (name.endsWith('.')) {
                name = name.slice(0, -1);
            }

            // For cases where first token is IN or a record type, use empty name
            if (name.toUpperCase() === 'IN' || validTypes.includes(name.toUpperCase())) {
                name = '';
            }

            // Find TTL - it's usually before the IN class
            let ttl = 3600; // Default TTL
            for (let i = 1; i < typeIndex; i++) {
                const possibleTtl = parseInt(tokens[i]);
                if (!isNaN(possibleTtl)) {
                    ttl = possibleTtl;
                    break;
                }
            }

            // Create record based on type
            const record: Partial<DnsRecord> = {
                name,
                ttl,
                type
            };

            switch (type) {
                case 'A':
                case 'AAAA':
                case 'CNAME':
                case 'NS':
                case 'PTR':
                case 'HTTPS':
                case 'ALIAS':
                case 'CAA':
                    if (typeIndex + 1 >= tokens.length) continue; // Skip if no value
                    record.value = tokens[typeIndex + 1];
                    break;
                case 'MX':
                    if (typeIndex + 2 >= tokens.length) continue; // Skip if not enough tokens
                    record.priority = parseInt(tokens[typeIndex + 1]) || 10;
                    record.value = tokens[typeIndex + 2];
                    break;
                case 'SRV':
                    if (typeIndex + 4 >= tokens.length) continue; // Skip if not enough tokens
                    record.priority = parseInt(tokens[typeIndex + 1]) || 0;
                    record.weight = parseInt(tokens[typeIndex + 2]) || 0;
                    record.port = parseInt(tokens[typeIndex + 3]) || 0;
                    record.value = tokens[typeIndex + 4];
                    break;
                case 'TXT':
                    // Handle quoted text
                    const txtValue = tokens.slice(typeIndex + 1).join(' ');
                    if (!txtValue) continue; // Skip if no value
                    // Clean quotes if present
                    record.value = txtValue.replace(/^"(.*)"$/, '$1');
                    break;
                default:
                    continue; // Skip unrecognized types
            }

            // Clean value - remove trailing dot if present
            if (record.value && record.value.endsWith('.')) {
                record.value = record.value.slice(0, -1);
            }

            // Add the record to the appropriate array if it has a valid value
            if (record.value !== undefined && records[type]) {
                // For invalid content check - ensure we have something that looks like a domain-related record
                // For domain tests - ensure we have at least one of these indicators
                const hasValidIndicators =
                    inIndex !== -1 || // Has 'IN' class
                    line.includes(' IN ') ||
                    validTypes.some((vt) => line.includes(` ${vt} `)) ||
                    /\d+\.\d+\.\d+\.\d+/.test(line) || // IP address pattern
                    /\s+NS\s+/.test(line) || // NS record pattern
                    /\s+MX\s+\d+\s+/.test(line); // MX record pattern

                if (hasValidIndicators) {
                    records[type].push(record);
                }
            }
        } catch (e) {
            console.error('Error parsing line:', line, e);
            // Continue to next line
        }
    }

    return records;
}

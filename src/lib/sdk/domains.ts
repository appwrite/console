import { AppwriteException, Client, type Payload } from '@appwrite.io/console';

/**
 * Domain
 */
export type Domain = {
    /**
     * Domain ID.
     */
    $id: string;
    /**
     * Domain creation time in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * Domain update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * Domain name.
     */
    domain: string;
    /**
     * Domain registrar (e.g. &quot;appwrite&quot; or &quot;third_party&quot;).
     */
    registrar: string;
    /**
     * Nameservers setting. &quot;Appwrite&quot; or empty string.
     */
    nameservers: string[];
    /**
     * Domain expiry date in ISO 8601 format.
     */
    expiry: string;
    /**
     * Domain renewal date in ISO 8601 format.
     */
    renewal: string;
    /**
     * If set to true, the domain will automatically renew.
     */
    autoRenewal: boolean;
    /**
     * Renewal price (in USD).
     */
    renewalPrice: number;
    /**
     * Team ID.
     */
    teamId: string;
};
/**
 * DNSRecord
 */
export type DnsRecord = {
    /**
     * DNS Record ID.
     */
    $id: string;
    /**
     * DNS Record creation time in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * DNS Record update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * DNS record type (e.g. A, CNAME, MX).
     */
    type: string;
    /**
     * Record name or subdomain.
     */
    name: string;
    /**
     * Value of the record (IP address, domain, etc.).
     */
    value: string;
    /**
     * Time to live (in seconds).
     */
    ttl: number;
    /**
     * Record priority (commonly used for MX).
     */
    priority: number;
    /**
     * Whether this record is locked (read-only).
     */
    lock: boolean;
    /**
     * Record weight (used for SRV records).
     */
    weight: number;
    /**
     * Target port (used for SRV records).
     */
    port: number;
    /**
     * Comment for the DNS record.
     */
    comment: string;
};

export type DomainsList = {
    /**
     * Total number of domains documents that matched your query.
     */
    total: number;
    /**
     * List of domains.
     */
    domains: Domain[];
};
/**
 * DNS records list
 */
export type DnsRecordsList = {
    /**
     * Total number of dnsRecords documents that matched your query.
     */
    total: number;
    /**
     * List of dnsRecords.
     */
    dnsRecords: DnsRecord[];
};

export class Domains {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     * List domains
     *
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<DomainsList>}
     */
    async list(queries?: string[], search?: string): Promise<DomainsList> {
        const apiPath = '/domains';
        const payload: Payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Create a new domain.
     *
     *
     * @param {string} teamId
     * @param {string} domain
     * @throws {AppwriteException}
     * @returns {Promise<Domain>}
     */
    async create(teamId: string, domain: string): Promise<Domain> {
        if (typeof teamId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "teamId"');
        }
        if (typeof domain === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domain"');
        }
        const apiPath = '/domains';
        const payload: Payload = {};
        if (typeof teamId !== 'undefined') {
            payload['teamId'] = teamId;
        }
        if (typeof domain !== 'undefined') {
            payload['domain'] = domain;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Get a single domain by its unique ID.
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<Domain>}
     */
    async get(domainId: string): Promise<Domain> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Delete a domain by its unique ID.
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    async delete(domainId: string): Promise<{}> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('delete', uri, apiHeaders, payload);
    }
    /**
     * Verify which NS records are used and update the domain accordingly.
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<Domain>}
     */
    async updateNameservers(domainId: string): Promise<Domain> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/nameservers'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('patch', uri, apiHeaders, payload);
    }
    /**
     * Get Google Workspace preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async getPresetGoogleWorkspace(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/google-workspace'.replace(
            '{domainId}',
            domainId
        );
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Create Google Workspace preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async createPresetGoogleWorkspace(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/google-workspace'.replace(
            '{domainId}',
            domainId
        );
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Get iCloud preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async getPresetICloud(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/icloud'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Create iCloud preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async createPresetICloud(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/icloud'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Get Mailgun preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async getPresetMailgun(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/mailgun'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Create Mailgun preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async createPresetMailgun(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/mailgun'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Get Outlook preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async getPresetOutlook(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/outlook'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Create Outlook preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async createPresetOutlook(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/outlook'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Get ProtonMail preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async getPresetProtonMail(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/proton-mail'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Create ProtonMail preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async createPresetProtonMail(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/proton-mail'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Get Zoho preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async getPresetZoho(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/zoho'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Create Zoho Mail preset (Records)
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async createPresetZoho(domainId: string): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/presets/zoho'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * List DNS records for a given domain.
     *
     *
     * @param {string} domainId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecordsList>}
     */
    async listRecords(
        domainId: string,
        queries?: string[],
        search?: string
    ): Promise<DnsRecordsList> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/records'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Create a new A record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordA(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/a'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing A record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordA(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/a/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new AAAA record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordAAAA(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/aaaa'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing AAAA record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordAAAA(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/aaaa/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new ALIAS record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordAlias(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/alias'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing ALIAS record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordAlias(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/alias/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new CAA record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordCAA(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/caa'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing CAA record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordCAA(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/caa/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new CNAME record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordCNAME(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/cname'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing CNAME record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordCNAME(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/cname/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new HTTPS record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordHTTPS(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/https'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing HTTPS record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordHTTPS(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/https/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new MX record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {number} priority
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordMX(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        priority: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        if (typeof priority === 'undefined') {
            throw new AppwriteException('Missing required parameter: "priority"');
        }
        const apiPath = '/domains/{domainId}/records/mx'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof priority !== 'undefined') {
            payload['priority'] = priority;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing MX record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {number} priority
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordMX(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        priority: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        if (typeof priority === 'undefined') {
            throw new AppwriteException('Missing required parameter: "priority"');
        }
        const apiPath = '/domains/{domainId}/records/mx/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof priority !== 'undefined') {
            payload['priority'] = priority;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new NS record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordNS(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/ns'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing NS record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordNS(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/ns/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new SRV record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {number} priority
     * @param {number} weight
     * @param {number} port
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordSRV(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        priority: number,
        weight: number,
        port: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        if (typeof priority === 'undefined') {
            throw new AppwriteException('Missing required parameter: "priority"');
        }
        if (typeof weight === 'undefined') {
            throw new AppwriteException('Missing required parameter: "weight"');
        }
        if (typeof port === 'undefined') {
            throw new AppwriteException('Missing required parameter: "port"');
        }
        const apiPath = '/domains/{domainId}/records/srv'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof priority !== 'undefined') {
            payload['priority'] = priority;
        }
        if (typeof weight !== 'undefined') {
            payload['weight'] = weight;
        }
        if (typeof port !== 'undefined') {
            payload['port'] = port;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing SRV record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {number} priority
     * @param {number} weight
     * @param {number} port
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordSRV(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        priority: number,
        weight: number,
        port: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        if (typeof priority === 'undefined') {
            throw new AppwriteException('Missing required parameter: "priority"');
        }
        if (typeof weight === 'undefined') {
            throw new AppwriteException('Missing required parameter: "weight"');
        }
        if (typeof port === 'undefined') {
            throw new AppwriteException('Missing required parameter: "port"');
        }
        const apiPath = '/domains/{domainId}/records/srv/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof priority !== 'undefined') {
            payload['priority'] = priority;
        }
        if (typeof weight !== 'undefined') {
            payload['weight'] = weight;
        }
        if (typeof port !== 'undefined') {
            payload['port'] = port;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Create a new TXT record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async createRecordTXT(
        domainId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/txt'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     * Update an existing TXT record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @param {string} name
     * @param {string} value
     * @param {number} ttl
     * @param {string} comment
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async updateRecordTXT(
        domainId: string,
        recordId: string,
        name: string,
        value: string,
        ttl: number,
        comment?: string
    ): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        if (typeof value === 'undefined') {
            throw new AppwriteException('Missing required parameter: "value"');
        }
        if (typeof ttl === 'undefined') {
            throw new AppwriteException('Missing required parameter: "ttl"');
        }
        const apiPath = '/domains/{domainId}/records/txt/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof value !== 'undefined') {
            payload['value'] = value;
        }
        if (typeof ttl !== 'undefined') {
            payload['ttl'] = ttl;
        }
        if (typeof comment !== 'undefined') {
            payload['comment'] = comment;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
    /**
     * Get a single DNS record for a given domain by record ID.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @throws {AppwriteException}
     * @returns {Promise<DnsRecord>}
     */
    async getRecord(domainId: string, recordId: string): Promise<DnsRecord> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        const apiPath = '/domains/{domainId}/records/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Delete a DNS record for the given domain.
     *
     *
     * @param {string} domainId
     * @param {string} recordId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    async deleteRecord(domainId: string, recordId: string): Promise<{}> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof recordId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "recordId"');
        }
        const apiPath = '/domains/{domainId}/records/{recordId}'
            .replace('{domainId}', domainId)
            .replace('{recordId}', recordId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('delete', uri, apiHeaders, payload);
    }
    /**
     * Update domain team.
     *
     *
     * @param {string} domainId
     * @param {string} teamId
     * @throws {AppwriteException}
     * @returns {Promise<Domain>}
     */
    async updateTeam(domainId: string, teamId: string): Promise<Domain> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof teamId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "teamId"');
        }
        const apiPath = '/domains/{domainId}/team'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof teamId !== 'undefined') {
            payload['teamId'] = teamId;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('patch', uri, apiHeaders, payload);
    }
    /**
     * Retrieve the DNS zone file for the given domain.
     *
     *
     * @param {string} domainId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    async getZone(domainId: string): Promise<{}> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        const apiPath = '/domains/{domainId}/zone'.replace('{domainId}', domainId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     * Update the DNS zone for the given domain using the provided zone file content. All parsed records are imported and then the main domain document is returned.
     *
     *
     * @param {string} domainId
     * @param {string} content
     * @throws {AppwriteException}
     * @returns {Promise<Domain>}
     */
    async updateZone(domainId: string, content: string): Promise<Domain> {
        if (typeof domainId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domainId"');
        }
        if (typeof content === 'undefined') {
            throw new AppwriteException('Missing required parameter: "content"');
        }
        const apiPath = '/domains/{domainId}/zone'.replace('{domainId}', domainId);
        const payload: Payload = {};
        if (typeof content !== 'undefined') {
            payload['content'] = content;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        payload['project'] = this.client.config.project;

        return await this.client.call('put', uri, apiHeaders, payload);
    }
}

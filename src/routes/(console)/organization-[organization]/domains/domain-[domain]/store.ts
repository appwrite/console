import { page } from '$app/stores';
import type { Column } from '$lib/helpers/types';
import type { Domain } from '$lib/sdk/domains';
import { derived, writable } from 'svelte/store';

export const domain = derived(page, ($page) => $page.data.domain as Domain);
export const columns = writable<Column[]>([
    { id: 'name', title: 'Name', type: 'string', width: { min: 150 } },
    { id: 'type', title: 'Type', type: 'string', width: 125 },
    { id: 'value', title: 'Value', type: 'string', width: 250 },
    { id: 'ttl', title: 'TTL', type: 'integer', width: 100 },
    { id: 'priority', title: 'Priority', type: 'integer', width: 80, hide: true },
    { id: 'comment', title: 'Comment', type: 'string', width: { min: 180 } },
    { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 120 } }
]);

export const recordTypes = [
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
        helper: 'CAA records define which certificate authorities can issue SSL certificates for your domain. To avoid setup issues, make sure certainly.com is authorized.'
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

export const presets = ['Zoho', 'Mailgun', 'Outlook', 'Proton Mail', 'iCloud', 'Google Workspace'];

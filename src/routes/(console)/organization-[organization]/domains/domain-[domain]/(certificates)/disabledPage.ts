import { PAGE_LIMIT, Dependencies } from '$lib/constants';
import { getSearch, pageToOffset, getLimit, getPage } from '$lib/helpers/load';

export const load = async ({ parent, depends, url, route }) => {
    depends(Dependencies.DOMAIN);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const search = getSearch(url);
    const { domain } = await parent();

    //TODO: fetch certificates
    return {
        domain,
        certificates: mockCertificates,
        offset,
        limit,
        search
    };
};

const mockCertificates = {
    total: 3,
    certificates: [
        {
            $id: 'cert_123abc',
            domain: 'example.com',
            renewAt: '2023-01-15T10:30:00Z',
            autoRenewal: true,
            issuedAt: '2023-01-15T10:30:00Z',
            expiresAt: '2026-01-15T10:30:00Z',
            issuer: "Let's Encrypt",
            status: 'active',
            type: 'SSL/TLS',
            algorithm: 'RSA 2048'
        },
        {
            $id: 'cert_456def',
            domain: '*.example.com',
            renewAt: '2023-03-20T14:15:00Z',
            autoRenewal: false,
            issuedAt: '2023-03-20T14:15:00Z',
            expiresAt: '2024-03-20T14:15:00Z',
            issuer: "Let's Encrypt",
            status: 'active',
            type: 'SSL/TLS',
            algorithm: 'RSA 2048'
        },
        {
            $id: 'cert_789ghi',
            domain: 'api.example.com',
            renewAt: '2023-06-01T09:00:00Z',
            autoRenewal: false,
            issuedAt: '2023-06-01T09:00:00Z',
            expiresAt: '2023-12-01T09:00:00Z',
            issuer: "Let's Encrypt",
            status: 'expired',
            type: 'SSL/TLS',
            algorithm: 'RSA 2048'
        }
    ]
};

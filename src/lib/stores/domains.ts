import { RedirectStatusCode } from '@appwrite.io/console';

export const statusCodeOptions = [
    {
        label: '301 Moved permanently',
        value: RedirectStatusCode.MovedPermanently
    },
    {
        label: '302 Found',
        value: RedirectStatusCode.Found
    },
    {
        label: '307 Temporary redirect',
        value: RedirectStatusCode.TemporaryRedirect
    },
    {
        label: '308 Permanent redirect',
        value: RedirectStatusCode.PermanentRedirect
    }
];

export type RecordType =
    | 'A'
    | 'AAAA'
    | 'CNAME'
    | 'MX'
    | 'TXT'
    | 'NS'
    | 'SRV'
    | 'CAA'
    | 'HTTPS'
    | 'ALIAS';

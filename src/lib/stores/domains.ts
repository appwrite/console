import { StatusCode } from '@appwrite.io/console';

export const statusCodeOptions = [
    {
        label: '301 Moved permanently',
        value: StatusCode.MovedPermanently
    },
    {
        label: '302 Found',
        value: StatusCode.Found
    },
    {
        label: '307 Temporary redirect',
        value: StatusCode.TemporaryRedirect
    },
    {
        label: '308 Permanent redirect',
        value: StatusCode.PermanentRedirect
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

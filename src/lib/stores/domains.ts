import { StatusCode } from '@appwrite.io/console';

export const statusCodeOptions = [
    {
        label: '301 Moved permanently',
        value: StatusCode.MovedPermanently301
    },
    {
        label: '302 Found',
        value: StatusCode.Found302
    },
    {
        label: '307 Temporary redirect',
        value: StatusCode.TemporaryRedirect307
    },
    {
        label: '308 Permanent redirect',
        value: StatusCode.PermanentRedirect308
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

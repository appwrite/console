import { ProxyRuleStatus, type Models } from '@appwrite.io/console';

export type ProxyRuleStatusValue =
    | 'created'
    | 'verified'
    | 'verifying'
    | 'unverified'
    | ProxyRuleStatus
    | undefined;

export function isProxyRuleVerified(status: ProxyRuleStatusValue): boolean {
    return status === ProxyRuleStatus.Verified;
}

export function normalizeProxyRuleStatus(status: ProxyRuleStatusValue): ProxyRuleStatusValue {
    if (status === ProxyRuleStatus.Created) {
        return ProxyRuleStatus.Unverified;
    }

    return status;
}

export function isProxyRuleRetryable(status: ProxyRuleStatusValue): boolean {
    const normalizedStatus = normalizeProxyRuleStatus(status);

    return normalizedStatus === ProxyRuleStatus.Unverified;
}

export function isProxyRuleLogsViewable(proxyRule: Models.ProxyRule): boolean {
    return (
        Boolean(proxyRule.logs?.length) &&
        normalizeProxyRuleStatus(proxyRule.status) !== ProxyRuleStatus.Verified
    );
}

export function getProxyRuleUpdatedPrefix(status: ProxyRuleStatusValue): string {
    const normalizedStatus = normalizeProxyRuleStatus(status);

    if (normalizedStatus === ProxyRuleStatus.Verifying) {
        return 'Updated';
    }

    if (normalizedStatus === ProxyRuleStatus.Unverified) {
        return 'Failed';
    }

    return '';
}

export function getProxyRuleStatusBadge(status: ProxyRuleStatusValue): {
    content: string;
    type?: 'error';
} | null {
    const normalizedStatus = normalizeProxyRuleStatus(status);

    if (normalizedStatus === ProxyRuleStatus.Verifying) {
        return {
            content: 'Generating certificate'
        };
    }

    if (normalizedStatus === ProxyRuleStatus.Unverified) {
        return {
            content: 'Certificate generation failed',
            type: 'error'
        };
    }

    return null;
}

import { describe, expect, it } from 'vitest';
import type { Models } from '@appwrite.io/console';
import {
    DEFAULT_MCP_RESOURCE_URLS,
    MAX_SCOPE_PARAM_LENGTH,
    composeGrantedScopes,
    isMcpGrant,
    isMcpResource,
    mcpResourceUrls,
    normalizeResourceUrl
} from './oauth2-mcp';
import { splitConsentScopes } from './oauth2-scopes';

function grantWith(resources: string[]): Models.Oauth2Grant {
    return { resources } as unknown as Models.Oauth2Grant;
}

describe('mcpResourceUrls', () => {
    it('defaults to the hosted MCP resource URI', () => {
        expect(mcpResourceUrls('')).toEqual(DEFAULT_MCP_RESOURCE_URLS);
    });

    it('parses a comma-separated override', () => {
        expect(mcpResourceUrls('http://localhost:8000/mcp, https://mcp.appwrite.io/mcp')).toEqual([
            'http://localhost:8000/mcp',
            'https://mcp.appwrite.io/mcp'
        ]);
    });

    it('normalizes trailing slashes only', () => {
        expect(normalizeResourceUrl('https://mcp.appwrite.io/mcp/')).toBe(
            'https://mcp.appwrite.io/mcp'
        );
        expect(normalizeResourceUrl('https://MCP.appwrite.io/mcp')).toBe(
            'https://MCP.appwrite.io/mcp'
        );
    });
});

describe('isMcpGrant', () => {
    const urls = mcpResourceUrls('');

    it('detects the hosted MCP resource URI', () => {
        expect(isMcpGrant(grantWith(['https://mcp.appwrite.io/mcp']), urls)).toBe(true);
    });

    it('tolerates a trailing slash on the requested resource', () => {
        expect(isMcpGrant(grantWith(['https://mcp.appwrite.io/mcp/']), urls)).toBe(true);
    });

    it('ignores unrelated resources', () => {
        expect(isMcpGrant(grantWith(['https://api.example.com']), urls)).toBe(false);
        expect(isMcpGrant(grantWith([]), urls)).toBe(false);
        expect(isMcpGrant(grantWith(undefined as unknown as string[]), urls)).toBe(false);
    });

    it('does not loosen to any URL ending in /mcp', () => {
        expect(isMcpGrant(grantWith(['https://evil.example.com/mcp']), urls)).toBe(false);
    });

    it('honors the env-style override list', () => {
        const local = mcpResourceUrls('http://localhost:8000/mcp');
        expect(isMcpGrant(grantWith(['http://localhost:8000/mcp']), local)).toBe(true);
        expect(isMcpGrant(grantWith(['https://mcp.appwrite.io/mcp']), local)).toBe(false);
        expect(isMcpResource(['http://localhost:8000/mcp/'], local)).toBe(true);
    });
});

describe('composeGrantedScopes', () => {
    const REQUESTED = [
        'openid',
        'profile',
        'email',
        'all',
        'project:all',
        'organization:all',
        'project:tables.read',
        'project:tables.write',
        'project:rows.read',
        'project:rows.write',
        'project:files.read',
        'project:executions.write',
        'organization:projects.read',
        'organization:projects.write'
    ];
    const model = splitConsentScopes(REQUESTED);

    const fullInput = {
        model,
        project: {},
        organization: {},
        readOnly: false,
        resourcesNarrowed: false
    };

    it('omits scope entirely when the selection is untouched', () => {
        const composed = composeGrantedScopes(fullInput);
        expect(composed.scope).toBeUndefined();
        expect(composed.untouched).toBe(true);
        expect(composed.blocked).toBe(false);
    });

    it('treats an explicit all-selected record as untouched', () => {
        const composed = composeGrantedScopes({
            ...fullInput,
            project: {
                tables: { selected: true, level: 'full' },
                rows: { selected: true, level: 'full' },
                files: { selected: true, level: 'full' },
                executions: { selected: true, level: 'full' }
            }
        });
        expect(composed.scope).toBeUndefined();
        expect(composed.untouched).toBe(true);
    });

    it('drops `all` and collapses to umbrellas when only resources are narrowed', () => {
        const composed = composeGrantedScopes({ ...fullInput, resourcesNarrowed: true });
        expect(composed.untouched).toBe(false);
        expect(composed.scope).toBe('openid profile email project:all organization:all');
    });

    it('emits both .read and .write for a kept Read + Write resource', () => {
        const composed = composeGrantedScopes({
            ...fullInput,
            project: {
                rows: { selected: false, level: 'full' },
                files: { selected: false, level: 'full' },
                executions: { selected: false, level: 'full' }
            },
            organization: { projects: { selected: false, level: 'full' } }
        });
        const scopes = composed.scope!.split(' ');
        expect(scopes).toContain('project:tables.read');
        expect(scopes).toContain('project:tables.write');
        expect(scopes).not.toContain('all');
        expect(scopes).not.toContain('project:all');
        expect(scopes).not.toContain('project:rows.read');
    });

    it('keeps only .read for a read-level resource — write never implies read', () => {
        const composed = composeGrantedScopes({
            ...fullInput,
            project: {
                tables: { selected: true, level: 'read' },
                rows: { selected: false, level: 'full' },
                files: { selected: false, level: 'full' },
                executions: { selected: false, level: 'full' }
            },
            organization: { projects: { selected: false, level: 'full' } }
        });
        const scopes = composed.scope!.split(' ');
        expect(scopes).toContain('project:tables.read');
        expect(scopes).not.toContain('project:tables.write');
    });

    it('collapses a fully kept tier to its umbrella while the other tier narrows', () => {
        const composed = composeGrantedScopes({
            ...fullInput,
            organization: { projects: { selected: true, level: 'read' } }
        });
        const scopes = composed.scope!.split(' ');
        expect(scopes).toContain('project:all');
        expect(scopes).toContain('organization:projects.read');
        expect(scopes).not.toContain('organization:all');
        expect(scopes).not.toContain('all');
    });

    it('always retains the identity scopes', () => {
        const composed = composeGrantedScopes({
            ...fullInput,
            project: {
                tables: { selected: true, level: 'read' },
                rows: { selected: false, level: 'full' },
                files: { selected: false, level: 'full' },
                executions: { selected: false, level: 'full' }
            },
            organization: { projects: { selected: false, level: 'full' } }
        });
        expect(composed.scope!.startsWith('openid profile email ')).toBe(true);
    });

    it('the master read-only toggle keeps only .read tokens', () => {
        const composed = composeGrantedScopes({ ...fullInput, readOnly: true });
        const scopes = composed.scope!.split(' ');
        expect(scopes).toContain('project:tables.read');
        expect(scopes).toContain('project:rows.read');
        expect(scopes).toContain('project:files.read');
        expect(scopes).toContain('organization:projects.read');
        expect(scopes.some((scope) => scope.endsWith('.write'))).toBe(false);
        expect(scopes).not.toContain('all');
        expect(scopes).not.toContain('project:all');
    });

    it('blocks when no non-identity scope remains', () => {
        const composed = composeGrantedScopes({
            ...fullInput,
            project: {
                tables: { selected: false, level: 'full' },
                rows: { selected: false, level: 'full' },
                files: { selected: false, level: 'full' },
                executions: { selected: false, level: 'full' }
            },
            organization: { projects: { selected: false, level: 'full' } }
        });
        expect(composed.blocked).toBe(true);
    });

    it('every emitted scope is a literal subset of the request', () => {
        const requested = new Set(REQUESTED);
        const composed = composeGrantedScopes({
            ...fullInput,
            readOnly: true,
            resourcesNarrowed: true
        });
        for (const scope of composed.scope!.split(' ')) {
            expect(requested.has(scope)).toBe(true);
        }
    });

    it('collapses the larger tier to its umbrella when the length cap is exceeded', () => {
        const manyScopes = ['openid', 'all', 'project:all', 'organization:all'];
        for (let i = 0; i < 900; i++) {
            manyScopes.push(`project:resource${i}.read`);
        }
        manyScopes.push('organization:projects.read');
        const bigModel = splitConsentScopes(manyScopes);
        // Narrow one project resource so the tier can't collapse on its own —
        // the remaining ~899 granular tokens blow past the cap.
        const narrowedProject: Record<string, { selected: boolean; level: 'full' | 'read' }> = {
            resource0: { selected: false, level: 'full' }
        };
        const long = composeGrantedScopes({
            model: bigModel,
            project: narrowedProject,
            organization: { projects: { selected: true, level: 'read' } },
            readOnly: false,
            resourcesNarrowed: false
        });
        expect(long.lengthCollapsed).toBe(true);
        expect(long.scope!.length).toBeLessThanOrEqual(MAX_SCOPE_PARAM_LENGTH);
        expect(long.scope!.split(' ')).toContain('project:all');
    });
});

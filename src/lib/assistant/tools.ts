/**
 * Agentic console assistant — client-side tool definitions.
 *
 * Tools are executed here using the user's own SDK session, so Appwrite's
 * normal permission enforcement applies automatically.  No credentials are
 * forwarded to the assistant service.
 *
 * Tiers match what the PHP gateway grants:
 *   none      – OSS / Cloud Free (docs Q&A only, no tools)
 *   read      – Cloud Pro+  (read-only data queries)
 *   readwrite – Cloud Scale+ (read + write, write tools require approval)
 */

import { sdk } from '$lib/stores/sdk';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToolTier = 'none' | 'read' | 'readwrite';

export interface ToolDef {
    /** Human-readable label shown in the approval modal */
    label: string;
    /** Whether the user must explicitly confirm before execution */
    requiresApproval: boolean;
    /** Minimum tier needed to call this tool */
    tier: Exclude<ToolTier, 'none'>;
    /** Execute the tool and return a JSON-serialisable result */
    execute: (args: Record<string, unknown>) => Promise<unknown>;
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

export const tools: Record<string, ToolDef> = {
    getBillingPlan: {
        label: 'Get billing plan',
        requiresApproval: false,
        tier: 'read',
        execute: async ({ orgId }: { orgId: string }) => {
            const org = await sdk.forConsole.organizations.get(orgId);
            return {
                billingPlan: org.billingPlan,
                billingNextInvoiceDate: org.billingNextInvoiceDate,
                billingCurrentInvoiceDate: org.billingCurrentInvoiceDate,
            };
        },
    },

    getProjectUsage: {
        label: 'Get project usage',
        requiresApproval: false,
        tier: 'read',
        execute: async ({ projectId }: { projectId: string }) => {
            const usage = await sdk.forConsole.projects.getUsage(projectId, '30d');
            return {
                bandwidth: usage.bandwidth,
                storage: usage.storage,
                users: usage.users,
                requests: usage.requests,
                executions: usage.executions,
                documents: usage.documents,
            };
        },
    },

    listApiKeys: {
        label: 'List API keys',
        requiresApproval: false,
        tier: 'read',
        execute: async ({ projectId }: { projectId: string }) => {
            const keys = await sdk.forConsole.projects.listKeys(projectId);
            return keys.keys.map((k) => ({
                $id: k.$id,
                name: k.name,
                scopes: k.scopes,
                expire: k.expire,
                accessedAt: k.accessedAt,
            }));
        },
    },

    listUsers: {
        label: 'List users',
        requiresApproval: false,
        tier: 'read',
        execute: async ({ projectId }: { projectId: string }) => {
            // forProject needs region; default to empty string (uses console endpoint)
            const projectSdk = sdk.forProject('', projectId);
            const list = await projectSdk.users.list();
            return {
                total: list.total,
                users: list.users.slice(0, 10).map((u) => ({
                    $id: u.$id,
                    name: u.name,
                    email: u.email,
                    status: u.status,
                    $createdAt: u.$createdAt,
                })),
            };
        },
    },

    createApiKey: {
        label: 'Create API key',
        requiresApproval: true,
        tier: 'readwrite',
        execute: async ({
            projectId,
            name,
            scopes,
            expire,
        }: {
            projectId: string;
            name: string;
            scopes: string[];
            expire?: string | null;
        }) => {
            const key = await sdk.forConsole.projects.createKey(
                projectId,
                name,
                scopes,
                expire ?? '',
            );
            return {
                $id: key.$id,
                name: key.name,
                scopes: key.scopes,
                expire: key.expire,
                secret: key.secret,
            };
        },
    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns tool names allowed for the given tier */
export function allowedTools(tier: ToolTier): string[] {
    if (tier === 'none') return [];
    return Object.entries(tools)
        .filter(([, def]) => tier === 'readwrite' || def.tier === 'read')
        .map(([name]) => name);
}

/** Execute a tool by name, returning its result */
export async function executeTool(
    name: string,
    args: Record<string, unknown>,
): Promise<unknown> {
    const def = tools[name];
    if (!def) throw new Error(`Unknown tool: ${name}`);
    return def.execute(args);
}

import { AppwriteException } from '@appwrite.io/console';
import type { Client, Models, Payload } from '@appwrite.io/console';

export class Workspaces {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     *     List all workspaces. This endpoint supports pagination and searching.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<WorkspacesList>}
     */
    list(queries?: string[], search?: string): Promise<WorkspacesList> {
        const apiPath = '/workspaces';
        const payload: Payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
        }

        return this.client.call(
            'get',
            uri,
            apiHeaders,
            payload
        );
    }
    /**
     *     Create a new workspace. You can pass a custom ID or generate a random ID with `ID.unique()`.
     *
     * @param {string} name
     * @param {string} workspaceId
     * @param {string} specification
     * @throws {AppwriteException}
     * @returns {Promise<Workspace>}
     */
    create(name: string, workspaceId?: string, specification?: string): Promise<Workspace> {
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        const apiPath = '/workspaces';
        const payload: Payload = {};
        if (typeof workspaceId !== 'undefined') {
            payload['workspaceId'] = workspaceId;
        }
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof specification !== 'undefined') {
            payload['specification'] = specification;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json',
        }

        return this.client.call(
            'post',
            uri,
            apiHeaders,
            payload
        );
    }
    /**
     *     Get workspace with ID.
     *
     * @param {string} workspaceId
     * @throws {AppwriteException}
     * @returns {Promise<Workspace>}
     */
    get(workspaceId: string): Promise<Workspace> {
        if (typeof workspaceId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "workspaceId"');
        }
        const apiPath = '/workspaces/{workspaceId}'.replace('{workspaceId}', workspaceId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
        }

        return this.client.call(
            'get',
            uri,
            apiHeaders,
            payload
        );
    }
    /**
     *     Update a workspace name by its unique ID.
     *
     * @param {string} workspaceId
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Workspace>}
     */
    update(workspaceId: string, name?: string): Promise<Workspace> {
        if (typeof workspaceId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "workspaceId"');
        }
        const apiPath = '/workspaces/{workspaceId}'.replace('{workspaceId}', workspaceId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json',
        }

        return this.client.call(
            'patch',
            uri,
            apiHeaders,
            payload
        );
    }
    /**
     * Delete a workspace by its unique ID. Once deleted, the workspace will no longer be available 
and all associated resources will be removed.
     *
     * @param {string} workspaceId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(workspaceId: string): Promise<{}> {
        if (typeof workspaceId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "workspaceId"');
        }
        const apiPath = '/workspaces/{workspaceId}'.replace('{workspaceId}', workspaceId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json',
        }

        return this.client.call(
            'delete',
            uri,
            apiHeaders,
            payload
        );
    }
    
    /**
     * Create a new proxy rule for executing Appwrite Workspace on custom domain.
     *
     * @param {string} domain
     * @param {string} workspaceId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRule>}
     */
    createWorkspaceProxyRule(domain: string, workspaceId: string): Promise<Models.ProxyRule> {
        if (typeof domain === 'undefined') {
            throw new AppwriteException('Missing required parameter: "domain"');
        }
        if (typeof workspaceId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "workspaceId"');
        }
        const apiPath = '/proxy/rules/workspace';
        const payload: Payload = {};
        if (typeof domain !== 'undefined') {
            payload['domain'] = domain;
        }
        if (typeof workspaceId !== 'undefined') {
            payload['workspaceId'] = workspaceId;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json',
        }

        return this.client.call(
            'post',
            uri,
            apiHeaders,
            payload
        );
    }
}

/**
 * Workspace
 */
export type Workspace = {
    /**
     * Workspace ID
     */
    $id: string;
    /**
     * Workspace name
     */
    name: string;
    /**
     * Machine specification for builds and executions.
     */
    specification: string;
    /**
     * Workspace status
     */
    status: string;
    /**
     * User ID.
     */
    userId: string;
    /**
     * Team ID.
     */
    teamId: string;
}

export type WorkspacesList = {
    /**
     * Total number of workspaces documents that matched your query.
     */
    total: number;
    /**
     * List of workspaces.
     */
    workspaces: Workspace[];
}
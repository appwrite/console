import { AppwriteException } from '@appwrite.io/console';
import type { Client, Payload } from '@appwrite.io/console';

export class Imagine {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     *     List all artifacts. This endpoint supports pagination and searching.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<ArtifactsList>}
     */
    list(queries?: string[], search?: string): Promise<ArtifactsList> {
        const apiPath = '/imagine/artifacts';
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

        return this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     *     Create a new artifact. You can pass a custom ID or generate a random ID with `ID.unique()`.
     *
     * @param {string} artifactId
     * @throws {AppwriteException}
     * @returns {Promise<Artifact>}
     */
    create(artifactId: string): Promise<Artifact> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        const apiPath = '/imagine/artifacts';
        const payload: Payload = {};
        if (typeof artifactId !== 'undefined') {
            payload['artifactId'] = artifactId;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     *     Get an artifact by its unique ID.
     *
     * @param {string} artifactId
     * @throws {AppwriteException}
     * @returns {Promise<Artifact>}
     */
    get(artifactId: string): Promise<Artifact> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}'.replace('{artifactId}', artifactId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     *     Update an artifact name by its unique ID.
     *
     * @param {string} artifactId
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Artifact>}
     */
    update(artifactId: string, name?: string): Promise<Artifact> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}'.replace('{artifactId}', artifactId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('patch', uri, apiHeaders, payload);
    }
    /**
     * Delete an artifact by its unique ID. Once deleted, the artifact will no longer be available 
and all associated resources will be removed.
     *
     * @param {string} artifactId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(artifactId: string): Promise<{}> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}'.replace('{artifactId}', artifactId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('delete', uri, apiHeaders, payload);
    }
    /**
     *     List all conversations for an artifact. This endpoint supports pagination and searching.
     *
     * @param {string} artifactId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<ConversationsList>}
     */
    listConversations(
        artifactId: string,
        queries?: string[],
        search?: string
    ): Promise<ConversationsList> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}/conversations'.replace(
            '{artifactId}',
            artifactId
        );
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

        return this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     *     Create a new conversation for an artifact.
     *
     * @param {string} artifactId
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Conversation>}
     */
    createConversation(artifactId: string, name: string): Promise<Conversation> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof name === 'undefined') {
            throw new AppwriteException('Missing required parameter: "name"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}/conversations'.replace(
            '{artifactId}',
            artifactId
        );
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     *     Get a conversation by its unique ID.
     *
     * @param {string} artifactId
     * @param {string} conversationId
     * @throws {AppwriteException}
     * @returns {Promise<Conversation>}
     */
    getConversation(artifactId: string, conversationId: string): Promise<Conversation> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof conversationId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "conversationId"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}/conversations/{conversationId}'
            .replace('{artifactId}', artifactId)
            .replace('{conversationId}', conversationId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     *     Update a conversation by its unique ID. This endpoint allows you to update the conversation&#039;s name, 
    messages, and status.
     *
     * @param {string} artifactId
     * @param {string} conversationId
     * @param {string} name
     * @throws {AppwriteException}
     * @returns {Promise<Conversation>}
     */
    updateConversation(
        artifactId: string,
        conversationId: string,
        name?: string
    ): Promise<Conversation> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof conversationId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "conversationId"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}/conversations/{conversationId}'
            .replace('{artifactId}', artifactId)
            .replace('{conversationId}', conversationId);
        const payload: Payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('patch', uri, apiHeaders, payload);
    }
    /**
     *     Delete a conversation by its unique ID. Once deleted, the conversation will no longer be available.
     *
     * @param {string} artifactId
     * @param {string} conversationId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteConversation(artifactId: string, conversationId: string): Promise<{}> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof conversationId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "conversationId"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}/conversations/{conversationId}'
            .replace('{artifactId}', artifactId)
            .replace('{conversationId}', conversationId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('delete', uri, apiHeaders, payload);
    }
    /**
     *     List all messages in a conversation. This endpoint supports pagination and searching.
     *
     * @param {string} artifactId
     * @param {string} conversationId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<ConversationsMessagesList>}
     */
    listMessages(
        artifactId: string,
        conversationId: string,
        queries?: string[],
        search?: string
    ): Promise<ConversationsMessagesList> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof conversationId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "conversationId"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}/conversations/{conversationId}/messages'
            .replace('{artifactId}', artifactId)
            .replace('{conversationId}', conversationId);
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

        return this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     *     Create a new message in a conversation.
     *
     * @param {string} artifactId
     * @param {string} conversationId
     * @param {Type} type
     * @param {string} content
     * @throws {AppwriteException}
     * @returns {Promise<Message>}
     */
    createMessage(
        artifactId: string,
        conversationId: string,
        type: Type,
        content: string
    ): Promise<Message> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof conversationId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "conversationId"');
        }
        if (typeof type === 'undefined') {
            throw new AppwriteException('Missing required parameter: "type"');
        }
        if (typeof content === 'undefined') {
            throw new AppwriteException('Missing required parameter: "content"');
        }
        const apiPath = '/imagine/artifacts/{artifactId}/conversations/{conversationId}/messages'
            .replace('{artifactId}', artifactId)
            .replace('{conversationId}', conversationId);
        const payload: Payload = {};
        if (typeof type !== 'undefined') {
            payload['type'] = type;
        }
        if (typeof content !== 'undefined') {
            payload['content'] = content;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('post', uri, apiHeaders, payload);
    }
    /**
     *     Get a message by its unique ID.
     *
     * @param {string} artifactId
     * @param {string} conversationId
     * @param {string} messageId
     * @throws {AppwriteException}
     * @returns {Promise<ConversationsMessage>}
     */
    getMessage(
        artifactId: string,
        conversationId: string,
        messageId: string
    ): Promise<ConversationsMessage> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof conversationId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "conversationId"');
        }
        if (typeof messageId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "messageId"');
        }
        const apiPath =
            '/imagine/artifacts/{artifactId}/conversations/{conversationId}/messages/{messageId}'
                .replace('{artifactId}', artifactId)
                .replace('{conversationId}', conversationId)
                .replace('{messageId}', messageId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('get', uri, apiHeaders, payload);
    }
    /**
     *     Update a message by its unique ID. This endpoint allows you to update the message&#039;s content and type.
     *
     * @param {string} artifactId
     * @param {string} conversationId
     * @param {string} messageId
     * @param {string} content
     * @param {string} type
     * @throws {AppwriteException}
     * @returns {Promise<ConversationsMessage>}
     */
    updateMessage(
        artifactId: string,
        conversationId: string,
        messageId: string,
        content?: string,
        type?: string
    ): Promise<ConversationsMessage> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof conversationId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "conversationId"');
        }
        if (typeof messageId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "messageId"');
        }
        const apiPath =
            '/imagine/artifacts/{artifactId}/conversations/{conversationId}/messages/{messageId}'
                .replace('{artifactId}', artifactId)
                .replace('{conversationId}', conversationId)
                .replace('{messageId}', messageId);
        const payload: Payload = {};
        if (typeof content !== 'undefined') {
            payload['content'] = content;
        }
        if (typeof type !== 'undefined') {
            payload['type'] = type;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('patch', uri, apiHeaders, payload);
    }
    /**
     *     Delete a message by its unique ID. Once deleted, the message will no longer be available.
     *
     * @param {string} artifactId
     * @param {string} conversationId
     * @param {string} messageId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteMessage(artifactId: string, conversationId: string, messageId: string): Promise<{}> {
        if (typeof artifactId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "artifactId"');
        }
        if (typeof conversationId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "conversationId"');
        }
        if (typeof messageId === 'undefined') {
            throw new AppwriteException('Missing required parameter: "messageId"');
        }
        const apiPath =
            '/imagine/artifacts/{artifactId}/conversations/{conversationId}/messages/{messageId}'
                .replace('{artifactId}', artifactId)
                .replace('{conversationId}', conversationId)
                .replace('{messageId}', messageId);
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json'
        };

        return this.client.call('delete', uri, apiHeaders, payload);
    }
}

export enum Type {
    Text = 'text',
    Image = 'image'
}
export type Artifact = {
    /**
     * Artifact unique ID.
     */
    $id: string;
    /**
     * Artifact creation date in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * Artifact update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * Artifact name.
     */
    name: string;
    /**
     * Artifact description.
     */
    description?: string;
    /**
     * Artifact version.
     */
    version?: string;
    /**
     * Framework used in the artifact.
     */
    framework?: string;
    /**
     * Technology stack used in the artifact.
     */
    stack?: string[];
    /**
     * Original prompt used to generate the artifact.
     */
    prompt?: string;
    /**
     * Current status of the artifact. Possible values: draft, processing, completed, failed.
     */
    status: string;
};
/**
 * Conversation
 */
export type Conversation = {
    /**
     * Conversation unique ID.
     */
    $id: string;
    /**
     * Conversation creation date in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * Conversation update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * ID of the artifact this conversation belongs to.
     */
    artifactId: string;
    /**
     * Conversation name.
     */
    name: string;
    /**
     * Search index string.
     */
    search: string;
};
/**
 * ConversationsMessage
 */
export type ConversationsMessage = {
    /**
     * Message unique ID.
     */
    $id: string;
    /**
     * Message creation date in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * Message update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * Artifact unique ID.
     */
    artifactId: string;
    /**
     * Conversation unique ID.
     */
    conversationId: string;
    /**
     * Message type.
     */
    type: string;
    /**
     * Message content.
     */
    content: string;
    /**
     * Message role.
     */
    role: string;
};
/**
 * Artifacts List
 */
export type ArtifactsList = {
    /**
     * Total number of artifacts documents that matched your query.
     */
    total: number;
    /**
     * List of artifacts.
     */
    artifacts: Artifact[];
};
/**
 * Conversations List
 */
export type ConversationsList = {
    /**
     * Total number of conversations documents that matched your query.
     */
    total: number;
    /**
     * List of conversations.
     */
    conversations: Conversation[];
};
/**
 * Conversations Messages List
 */
export type ConversationsMessagesList = {
    /**
     * Total number of messages documents that matched your query.
     */
    total: number;
    /**
     * List of messages.
     */
    messages: ConversationsMessage[];
};

/**
 * Message
 */
export type Message = {
    /**
     * Message ID.
     */
    $id: string;
    /**
     * Message creation time in ISO 8601 format.
     */
    $createdAt: string;
    /**
     * Message update date in ISO 8601 format.
     */
    $updatedAt: string;
    /**
     * Message provider type.
     */
    providerType: string;
    /**
     * Topic IDs set as recipients.
     */
    topics: string[];
    /**
     * User IDs set as recipients.
     */
    users: string[];
    /**
     * Target IDs set as recipients.
     */
    targets: string[];
    /**
     * The scheduled time for message.
     */
    scheduledAt?: string;
    /**
     * The time when the message was delivered.
     */
    deliveredAt?: string;
    /**
     * Delivery errors if any.
     */
    deliveryErrors?: string[];
    /**
     * Number of recipients the message was delivered to.
     */
    deliveredTotal: number;
    /**
     * Data of the message.
     */
    data: object;
    /**
     * Status of delivery.
     */
    status: string;
};

<script lang="ts">
    import { Modal, Code } from '$lib/components';
    import { InputSelect } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let row: Models.Row | null = null;
    export let databaseId: string;
    export let collectionId: string;

    const options = [
        { label: 'Web', value: 'web' },
        { label: 'Flutter', value: 'flutter' },
        { label: 'Android', value: 'android' },
        { label: 'Apple', value: 'apple' }
    ];

    let selectedSdk = 'web';

    $: documentId = row?.$id ?? '<DOCUMENT_ID>';
    $: language = (
        selectedSdk === 'web'
            ? 'js'
            : selectedSdk === 'flutter'
              ? 'dart'
              : selectedSdk === 'android'
                ? 'kotlin'
                : 'swift'
    ) as 'js' | 'dart' | 'kotlin' | 'swift';

    // Snippet generators
    function getSnippet(sdk: string, type: 'get' | 'list' | 'update' | 'delete') {
        if (sdk === 'web') {
            switch (type) {
                case 'get':
                    return `const result = await databases.getDocument(
    '${databaseId}', // databaseId
    '${collectionId}', // collectionId
    '${documentId}', // documentId
    [] // queries (optional)
);`;
                case 'list':
                    return `const result = await databases.listDocuments(
    '${databaseId}', // databaseId
    '${collectionId}', // collectionId
    [] // queries (optional)
);`;
                case 'update':
                    return `const result = await databases.updateDocument(
    '${databaseId}', // databaseId
    '${collectionId}', // collectionId
    '${documentId}', // documentId
    {}, // data (optional)
    [] // permissions (optional)
);`;
                case 'delete':
                    return `const result = await databases.deleteDocument(
    '${databaseId}', // databaseId
    '${collectionId}', // collectionId
    '${documentId}' // documentId
);`;
            }
        }
        if (sdk === 'flutter') {
            switch (type) {
                case 'get':
                    return `Future result = await databases.getDocument(
    databaseId: '${databaseId}',
    collectionId: '${collectionId}',
    documentId: '${documentId}',
);`;
                case 'list':
                    return `Future result = await databases.listDocuments(
    databaseId: '${databaseId}',
    collectionId: '${collectionId}',
);`;
                case 'update':
                    return `Future result = await databases.updateDocument(
    databaseId: '${databaseId}',
    collectionId: '${collectionId}',
    documentId: '${documentId}',
    data: {},
);`;
                case 'delete':
                    return `Future result = await databases.deleteDocument(
    databaseId: '${databaseId}',
    collectionId: '${collectionId}',
    documentId: '${documentId}',
);`;
            }
        }
        if (sdk === 'android') {
            switch (type) {
                case 'get':
                    return `val result = databases.getDocument(
    databaseId = "${databaseId}",
    collectionId = "${collectionId}",
    documentId = "${documentId}",
)`;
                case 'list':
                    return `val result = databases.listDocuments(
    databaseId = "${databaseId}",
    collectionId = "${collectionId}",
)`;
                case 'update':
                    return `val result = databases.updateDocument(
    databaseId = "${databaseId}",
    collectionId = "${collectionId}",
    documentId = "${documentId}",
    data = mapOf("a" to "b"),
)`;
                case 'delete':
                    return `val result = databases.deleteDocument(
    databaseId = "${databaseId}",
    collectionId = "${collectionId}",
    documentId = "${documentId}",
)`;
            }
        }
        if (sdk === 'apple') {
            switch (type) {
                case 'get':
                    return `let result = try await databases.getDocument(
    databaseId: "${databaseId}",
    collectionId: "${collectionId}",
    documentId: "${documentId}"
)`;
                case 'list':
                    return `let result = try await databases.listDocuments(
    databaseId: "${databaseId}",
    collectionId: "${collectionId}"
)`;
                case 'update':
                    return `let result = try await databases.updateDocument(
    databaseId: "${databaseId}",
    collectionId: "${collectionId}",
    documentId: "${documentId}",
    data: [:]
)`;
                case 'delete':
                    return `let result = try await databases.deleteDocument(
    databaseId: "${databaseId}",
    collectionId: "${collectionId}",
    documentId: "${documentId}"
)`;
            }
        }
        return '';
    }
</script>

<Modal title="Copy code snippet" bind:show size="m" hideFooter>
    <div class="u-margin-block-start-24">
        <InputSelect id="sdk" label="SDK" showLabel={false} {options} bind:value={selectedSdk} />
    </div>

    {#key language}
        <Layout.Stack gap="l" class="u-margin-block-start-24">
            <Layout.Stack gap="xs">
                <Typography.Text variant="m-500">Get row</Typography.Text>
                <Code code={getSnippet(selectedSdk, 'get')} {language} withCopy withLineNumbers />
            </Layout.Stack>

            <Layout.Stack gap="xs">
                <Typography.Text variant="m-500">List rows</Typography.Text>
                <Code code={getSnippet(selectedSdk, 'list')} {language} withCopy withLineNumbers />
            </Layout.Stack>

            <Layout.Stack gap="xs">
                <Typography.Text variant="m-500">Update row</Typography.Text>
                <Code
                    code={getSnippet(selectedSdk, 'update')}
                    {language}
                    withCopy
                    withLineNumbers />
            </Layout.Stack>

            <Layout.Stack gap="xs">
                <Typography.Text variant="m-500">Delete row</Typography.Text>
                <Code
                    code={getSnippet(selectedSdk, 'delete')}
                    {language}
                    withCopy
                    withLineNumbers />
            </Layout.Stack>
        </Layout.Stack>
    {/key}
</Modal>

<script lang="ts">
    import { page } from '$app/stores';
    import { Card, CopyInput } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { collection } from '../../store';
    import { doc } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import Document from './_document.svelte';

    const documentId = $page.params.document;

    const updateDocument = async () => {
        try {
            $doc = await sdkForProject.databases.updateDocument(
                $collection.$id,
                documentId,
                $doc,
                $doc.$read,
                $doc.$write
            );
            addNotification({
                message: 'Document was updated!',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<svelte:head>
    <title>Appwrite - Document</title>
</svelte:head>

<h1>Overview</h1>
<Card>
    {#if $doc}
        <Form on:submit={updateDocument}>
            <CopyInput value={$doc.$id} />
            <Document />
            <Button submit>Update</Button>
        </Form>
    {:else}
        loading
    {/if}
</Card>

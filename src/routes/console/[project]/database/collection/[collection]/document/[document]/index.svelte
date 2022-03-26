<script lang="ts">
    import { page } from '$app/stores';
    import { Card, Copy } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from '../../store';
    import { doc } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import Document from './_document.svelte';

    $: documentId = $page.params.document;

    onMount(async () => {
        $doc = await sdkForProject.database.getDocument($collection.$id, documentId);
    });

    const updateDocument = async () => {
        try {
            $doc = await sdkForProject.database.updateDocument(
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
            <Copy value={$doc.$id} />
            <Document />
            <Button submit>Update</Button>
        </Form>
    {:else}
        loading
    {/if}
</Card>

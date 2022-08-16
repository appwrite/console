<script lang="ts">
    import { Card } from '$lib/components';
    import { Container } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '../../../store';
    import { base } from '$app/paths';

    const projectId = $page.params.project;
    const keyId = $page.params.key;
    const request = sdkForConsole.projects.getKey(projectId, keyId);
    const deleteKey = async () => {
        await sdkForConsole.projects.deleteKey(projectId, keyId);
        addNotification({
            message: 'API key deleted.',
            type: 'success'
        });
        project.load(projectId);
        await goto(`${base}/console/${projectId}/keys`);
    };
</script>

<Container>
    <Card>
        {#await request}
            loading
        {:then response}
            <p>{response.name}</p>
            <Button danger on:click={deleteKey}>Delete</Button>
        {/await}
    </Card>
</Container>

<script lang="ts">
    import { page } from '$app/stores';
    import { CardGrid, CopyInput } from '$lib/components';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../store';

    let name: string = null;
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT.toString();

    onMount(async () => {
        await project.load($page.params.project);
        console.log($project);

        name ??= $project.name;
    });

    const updateName = async () => {
        try {
            await sdkForConsole.projects.update($project.$id, name);
            await project.load($project.$id);
            addNotification({
                type: 'success',
                message: 'Project name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Container>
    {#if $project}
        <Form on:submit={updateName}>
            <CardGrid>
                <h6 class="heading-level-7">Update Name</h6>

                <svelte:fragment slot="aside">
                    <FormList>
                        <InputText
                            id="name"
                            label="Name"
                            bind:value={name}
                            required
                            placeholder="Enter name" />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $project.name} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid>
            <h6 class="heading-level-7">API Credentials</h6>
            <p>
                Access Appwrite services using your API Endpoint and Project ID. You can connect
                Appwrite to your applications and server-side code by <a href="#/" class="link"
                    >integrating a new platform</a>
                or
                <a href="#/" class="link">creating an API key</a>.
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <CopyInput label="Project ID" showLabel={true} value={$project.$id} />
                    <CopyInput label="API Endpoint" showLabel={true} value={endpoint} />
                </FormList>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

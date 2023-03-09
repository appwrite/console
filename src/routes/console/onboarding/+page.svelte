<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import CustomId from '$lib/components/customId.svelte';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { ID } from '@aw-labs/appwrite-console';

    let name: string;
    let id: string;
    let showCustomId = false;
    let loading = false;

    async function createProject() {
        try {
            loading = true;
            const org = await createOrganization();
            const project = await sdkForConsole.projects.create(
                id ?? ID.unique(),
                name,
                org.$id,
                'default'
            );
            await invalidate(Dependencies.ACCOUNT);
            goto(`/console/project-${project.$id}`);
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId: org.$id
            });
        } catch (error) {
            loading = false;
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.ProjectCreate);
        }
    }

    async function createOrganization() {
        return await sdkForConsole.teams.create(ID.unique(), 'Personal Projects');
    }
</script>

<Container overlapCover size="large">
    <Card>
        <Form onSubmit={createProject}>
            <FormList>
                <InputText
                    id="name"
                    label="Project name"
                    placeholder="First Appwrite Project"
                    required
                    disabled={loading}
                    bind:value={name} />
                {#if !showCustomId}
                    <div>
                        <Pill button on:click={() => (showCustomId = !showCustomId)}>
                            <span class="icon-pencil" aria-hidden="true" /><span class="text">
                                Project ID
                            </span>
                        </Pill>
                    </div>
                {:else}
                    <CustomId bind:show={showCustomId} name="Project" bind:id />
                {/if}
                <Button fullWidth submit disabled={loading || name === ''} event="create_project">
                    Create project
                </Button>
            </FormList>
        </Form>
    </Card>
</Container>

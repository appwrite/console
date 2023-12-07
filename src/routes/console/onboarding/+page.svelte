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
    import { sdk } from '$lib/stores/sdk';
    import { isCloud } from '$lib/system';
    import { ID } from '@appwrite.io/console';

    let name: string;
    let id: string;
    let showCustomId = false;

    async function createProject() {
        try {
            const org = await createOrganization();
            const project = await sdk.forConsole.projects.create(
                id ?? ID.unique(),
                name,
                org.$id,
                isCloud ? 'eu-de' : 'default'
            );
            await invalidate(Dependencies.ACCOUNT);
            goto(`/console/project-${project.$id}`);
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId: org.$id
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.ProjectCreate);
        }
    }

    async function createOrganization() {
        if (isCloud) {
            return await sdk.forConsole.billing.createOrganization(
                ID.unique(),
                'Personal Projects',
                'tier-0',
                null
            );
        } else return await sdk.forConsole.teams.create(ID.unique(), 'Personal Projects');
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
                    <CustomId bind:show={showCustomId} name="Project" isProject bind:id />
                {/if}
                <Button fullWidth submit disabled={name === ''} event="create_project">
                    Create project
                </Button>
            </FormList>
        </Form>
    </Card>
</Container>

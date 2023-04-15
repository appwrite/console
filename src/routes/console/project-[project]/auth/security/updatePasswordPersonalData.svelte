<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';

    const projectId = $project.$id;
    let disallowPersonalData = $project.authDisallowPersonalData ?? false;

    async function updateDisallowPersonalData() {
        try {
            await sdk.forConsole.projects.updateDisallowPersonalData(
                projectId,
                disallowPersonalData
            );
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated disallow personal data.'
            });
            trackEvent(Submit.AuthDisallowPersonalDataUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthDisallowPersonalDataUpdate);
        }
    }
</script>

<Form onSubmit={updateDisallowPersonalData}>
    <CardGrid>
        <Heading tag="h2" size="7">Personal Data</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={disallowPersonalData}
                    id="passwordHisotryEnabled"
                    label="Disallow Personal Data" />
            </FormList>
            <p class="text">
                Do now allow passwords that contain any part of the user's personal data. This
                includes the user's <code>name</code>, <code>email</code>, or <code>phone</code>.
            </p>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={disallowPersonalData === $project.authDisallowPersonalData} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

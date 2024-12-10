<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';

    let authPersonalDataCheck = $project?.authPersonalDataCheck ?? false;

    async function updatePersonalDataCheck() {
        try {
            await sdk.forConsole.projects.updatePersonalDataCheck(
                $project.$id,
                authPersonalDataCheck
            );
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Toggled personal data checks for passwords'
            });
            trackEvent(Submit.AuthPersonalDataCheckUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthPersonalDataCheckUpdate);
        }
    }
</script>

<Form onSubmit={updatePersonalDataCheck}>
    <CardGrid>
        <Heading tag="h2" size="7" id="personal-data">Personal data</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={authPersonalDataCheck}
                    id="personalDataCheck"
                    label="Disallow personal data" />
            </FormList>
            <p class="text">
                Do not allow passwords that contain any part of the user's personal data. This
                includes the user's <code>name</code>, <code>email</code>, or <code>phone</code>.
            </p>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={authPersonalDataCheck === $project?.authPersonalDataCheck} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

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

    let notify = $project.authNotify ?? false;

    async function updateNotify() {
        try {
            await sdk.forConsole.projects.updateAuthNotify(
                $project.$id,
                notify
            );
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Toggled pasword AI checks for passwords'
            });
            trackEvent(Submit.AuthPasswordAiUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthPasswordAiUpdate);
        }
    }
</script>

<Form onSubmit={updateNotify}>
    <CardGrid>
        <Heading tag="h2" size="7" id="personal-data">Unusual activity<span class="tag eyebrow-heading-3" style="font-size: 12px; padding: 0px 8px; margin-left: 8px;">DEMO</span>
        </Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={notify}
                    id="unusualActivity"
                    label="Unusual activity" />
            </FormList>
            <p class="text">
                Enabling this option sends notification to the user when a session is created in a country for the first time.

            </p>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={notify === $project.authNotify} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

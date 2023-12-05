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

    let passwordAi = $project.authPasswordAi ?? false;

    async function updatePasswordAi() {
        try {
            await sdk.forConsole.projects.updateAuthPasswordAi(
                $project.$id,
                passwordAi
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

<Form onSubmit={updatePasswordAi}>
    <CardGrid>
        <Heading tag="h2" size="7" id="personal-data">AI Password</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={passwordAi}
                    id="passwordAi"
                    label="Disallow password AI" />
            </FormList>
            <p class="text">
                Do not allow passwords that AI does not approve. This prevents insafe easy-to-remember password that include <code>dates</code>, <code>locations</code>, <code>cities</code>, <code>names</code>, and more.
            </p>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={passwordAi === $project.authPasswordAi} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

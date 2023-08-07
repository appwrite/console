<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';
    import LL from '$i18n/i18n-svelte';

    let newPassword: string = null;

    async function updatePassword() {
        try {
            await sdk.forProject.users.updatePassword($user.$id, newPassword);
            newPassword = null;
            addNotification({
                message: $LL.components.notification.pswdUpdated(),
                type: 'success'
            });
            trackEvent(Submit.UserUpdatePassword);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdatePassword);
        }
    }
</script>

<Form onSubmit={updatePassword}>
    <CardGrid>
        <div>
            <Heading tag="h6" size="7">{$LL.console.project.title.userData.password()}</Heading>
        </div>

        <p>
            {$LL.console.project.texts.users.updatePassword.phaseOne()}{' '}<b
                >{$LL.console.project.texts.users.updatePassword.phaseTwo()}</b>
        </p>
        <svelte:fragment slot="aside">
            <ul>
                <InputPassword
                    id="newPassword"
                    label={$LL.console.project.forms.userData.update.password.label()}
                    placeholder={$LL.console.project.forms.userData.update.password.placeholder()}
                    autocomplete={false}
                    meter={false}
                    showPasswordButton={true}
                    bind:value={newPassword} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!newPassword} submit
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

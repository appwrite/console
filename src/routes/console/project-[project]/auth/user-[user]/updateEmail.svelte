<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputEmail } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';
    import LL from '$i18n/i18n-svelte';

    let userEmail: string = null;
    onMount(async () => {
        userEmail ??= $user.email;
    });

    async function updateEmail() {
        try {
            await sdk.forProject.users.updateEmail($user.$id, userEmail);
            await invalidate(Dependencies.USER);
            addNotification({
                message: $LL.components.notification.emailUpdated(),
                type: 'success'
            });
            trackEvent(Submit.UserUpdateEmail);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateEmail);
        }
    }
</script>

<Form onSubmit={updateEmail}>
    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.title.userData.email()}</Heading>
        <svelte:fragment slot="aside">
            <ul>
                <InputEmail
                    id="email"
                    label={$LL.console.project.forms.userData.update.email.label()}
                    placeholder={$LL.console.project.forms.userData.update.email.placeholder()}
                    autocomplete={false}
                    bind:value={userEmail} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userEmail === $user.email} submit
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

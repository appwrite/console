<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputPhone } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';
    import LL from '$i18n/i18n-svelte';

    let userPhone: string = null;
    onMount(async () => {
        userPhone ??= $user.phone;
    });

    async function updatePhone() {
        try {
            await sdk.forProject.users.updatePhone($user.$id, userPhone);
            await invalidate(Dependencies.USER);
            addNotification({
                message: 'Phone has been updated',
                type: 'success'
            });
            trackEvent(Submit.UserUpdatePhone);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdatePhone);
        }
    }
</script>

<Form onSubmit={updatePhone}>
    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.title.userData.phone()}</Heading>
        <svelte:fragment slot="aside">
            <ul>
                <InputPhone
                    id="phone"
                    label={$LL.console.forms.userData.update.phone.label()}
                    placeholder={$LL.console.forms.userData.update.phone.placeholder()}
                    autocomplete={false}
                    bind:value={userPhone} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userPhone === $user.phone} submit
                >{$LL.console.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

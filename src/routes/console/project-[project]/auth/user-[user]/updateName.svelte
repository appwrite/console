<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';
    import LL from '$i18n/i18n-svelte';

    let userName: string = null;
    onMount(async () => {
        userName ??= $user.name;
    });

    async function updateName() {
        try {
            await sdk.forProject.users.updateName($user.$id, userName);
            await invalidate(Dependencies.USER);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.UserUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.title.userData.name()}</Heading>

        <svelte:fragment slot="aside">
            <ul data-private>
                <InputText
                    id="name"
                    label={$LL.console.project.forms.userData.update.name.label()}
                    placeholder={$LL.console.project.forms.userData.update.name.placeholder()}
                    autocomplete={false}
                    bind:value={userName} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={userName === $user.name} submit
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

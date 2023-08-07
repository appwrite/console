<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $project.$id;
    let passwordDictionary = $project.authPasswordDictionary ?? false;

    async function updatePasswordDictionary() {
        try {
            await sdk.forConsole.projects.updateAuthPasswordDictionary(
                projectId,
                passwordDictionary
            );
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: $LL.components.notification.pswdDictonaryCheck()
            });
            trackEvent(Submit.AuthPasswordDictionaryUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthPasswordDictionaryUpdate);
        }
    }
</script>

<Form onSubmit={updatePasswordDictionary}>
    <CardGrid>
        <Heading tag="h2" size="7"
            >{$LL.console.project.title.security.passwordDictionary()}</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={passwordDictionary}
                    id="passwordDictionary"
                    label={$LL.console.project.forms.security.inputs.passwordDictionary.label()} />
            </FormList>
            <p class="text">
                {$LL.console.project.texts.security.passwordDictionary()}<a
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link"
                    href="https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt"
                    >{$LL.console.project.links.passwordDictionary()}</a>
            </p>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={passwordDictionary === $project.authPasswordDictionary} submit
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

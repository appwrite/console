<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../store';

    const projectId = $project.$id;
    let passwordDictionary = $project.authPasswordDictionary ?? 0;

    async function updatePasswordDictionary() {
        try {
            const path = '/projects/' + projectId + '/auth/password-dictionary';
            const uri = new URL(sdkForConsole.client.config.endpoint + path);
            await sdkForConsole.client.call(
                'patch',
                uri,
                {
                    'content-type': 'application/json'
                },
                {
                    enabled: passwordDictionary
                }
            );
            invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated password dictionary check.'
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

<Form on:submit={updatePasswordDictionary}>
    <CardGrid>
        <Heading tag="h2" size="6">Password Dictionary</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={passwordDictionary}
                    id="passwordDictionary"
                    label="Password Dictionary" />
            </FormList>
            <p class="text">
                When enabled it checks the user's password against the dictionary of most commonly
                used password. It uses <a
                    class="link"
                    href="https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt"
                    >10 K most common passwords</a> list.
            </p>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={passwordDictionary === $project.passwordDictionary} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

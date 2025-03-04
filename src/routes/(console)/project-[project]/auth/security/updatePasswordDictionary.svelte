<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography, Link } from '@appwrite.io/pink-svelte';
    import { project } from '../../store';

    let passwordDictionary = $project?.authPasswordDictionary ?? false;

    async function updatePasswordDictionary() {
        try {
            await sdk.forConsole.projects.updateAuthPasswordDictionary(
                $project.$id,
                passwordDictionary
            );
            await invalidate(Dependencies.PROJECT);
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

<Form onSubmit={updatePasswordDictionary}>
    <CardGrid>
        <svelte:fragment slot="title">Password dictionary</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={passwordDictionary}
                id="passwordDictionary"
                label="Password dictionary" />
            <Typography.Text>
                Enabling this option prevent users from setting insecure passwords by comparing the
                user's password with the <Link.Anchor
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link"
                    href="https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt"
                    >10k most commonly used passwords.</Link.Anchor>
            </Typography.Text>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={passwordDictionary === $project?.authPasswordDictionary} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>

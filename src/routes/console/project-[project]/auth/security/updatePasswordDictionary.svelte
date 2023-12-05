<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputSwitch } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';

    const projectId = $project.$id;
    let passwordDictionary = $project.authPasswordDictionary ?? false;
    let passwordDictionaryLength = $project.authPasswordDictionaryLength ?? '10k';

    async function updatePasswordDictionary() {
        try {
            await sdk.forConsole.projects.updateAuthPasswordDictionary(
                projectId,
                passwordDictionary,
                passwordDictionaryLength
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
        <Heading tag="h2" size="7" id="password-dictionary">Password dictionary</Heading>

        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={passwordDictionary}
                    id="passwordDictionary"
                    label="Password dictionary" />
                    {#if passwordDictionary}
                    <InputSelect
                    id="passwordDictionaryLength"
                    label="Select password dictionary length"
                    showLabel={false}
                    bind:value={passwordDictionaryLength}
                    options={[
                        {
                            label: '10 thousands',
                            value: '10k'
                        },{
                            label: '100 thousands',
                            value: '100k'
                        },{
                            label: '1 million',
                            value: '1m'
                        },{
                            label: '10 millions',
                            value: '10m'
                        }
                    ]}
                     />
                     {/if}
            </FormList>
            <p class="text">
                Enabling this option prevent users from setting insecure passwords by comparing the
                user's password with the <a
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link"
                    href="https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt"
                    >10k most commonly used passwords.</a>
            </p>
            
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={passwordDictionary === $project.authPasswordDictionary && passwordDictionaryLength === $project.authPasswordDictionaryLength} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

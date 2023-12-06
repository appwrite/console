<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputSwitch } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import Label from '$lib/elements/forms/label.svelte';
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
        <Heading tag="h2" size="7" id="password-dictionary">Password dictionary        <span class="tag eyebrow-heading-3" style="font-size: 12px; padding: 0px 8px; margin-left: 4px;">DEMO</span>
        </Heading>

        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={passwordDictionary}
                    id="passwordDictionary"
                    label="Password dictionary" />
                   
            </FormList>
            <p class="text">
                Enabling this option prevents users from setting insecure passwords by comparing the
                user's password with a list of the most commonly used passwords.
            </p>

            <div>
                {#if passwordDictionary}
                <Label>
                    Number of passwords
                </Label>

                <InputSelect
                wrapperTag="div"
                id="passwordDictionaryLength"
                label="Select password dictionary length"
                showLabel={false}
                bind:value={passwordDictionaryLength}
                options={[
                    {
                        label: '10k',
                        value: '10k'
                    },{
                        label: '100k',
                        value: '100k'
                    },{
                        label: '1m',
                        value: '1m'
                    },{
                        label: '10m',
                        value: '10m'
                    }
                ]}
                 />
                 {/if}
            </div>
            
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={passwordDictionary === $project.authPasswordDictionary && passwordDictionaryLength === $project.authPasswordDictionaryLength} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

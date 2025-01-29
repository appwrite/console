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
    import { Layout } from '@appwrite.io/pink-svelte';

    $: if (prefs) {
        if (JSON.stringify(prefs) !== JSON.stringify(Object.entries($user.prefs))) {
            arePrefsDisabled = false;
        } else {
            arePrefsDisabled = true;
        }
    }

    let prefs: [string, string][] = null;
    let arePrefsDisabled = true;

    onMount(async () => {
        prefs = Object.entries($user.prefs);
        if (!prefs?.length) {
            prefs.push(['', '']);
        }
    });

    async function updatePrefs() {
        try {
            let updatedPrefs = Object.fromEntries(prefs);

            await sdk.forProject.users.updatePrefs($user.$id, updatedPrefs);
            await invalidate(Dependencies.USER);
            arePrefsDisabled = true;

            addNotification({
                message: 'Preferences have been updated',
                type: 'success'
            });
            trackEvent(Submit.UserUpdatePreferences);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdatePreferences);
        }
    }
</script>

<Form onSubmit={updatePrefs}>
    <CardGrid>
        <Heading tag="h6" size="7">Preferences</Heading>
        <p>Add custom user preferences to share them across devices and sessions.</p>
        <svelte:fragment slot="aside">
            {#if prefs}
                {#each prefs as [key, value], index}
                    <Layout.Stack direction="row" alignItems="flex-end">
                        <InputText
                            id={`key-${index}`}
                            bind:value={key}
                            placeholder="Enter key"
                            label="Key"
                            required />
                        <InputText
                            id={`value-${index}`}
                            bind:value
                            placeholder="Enter value"
                            label="Value"
                            required />
                        <Button
                            text
                            icon
                            disabled={(!key || !value) && index === 0}
                            on:click={() => {
                                if (index === 0 && prefs?.length === 1) {
                                    prefs = [['', '']];
                                } else {
                                    prefs.splice(index, 1);
                                    prefs = prefs;
                                }
                            }}>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </Layout.Stack>
                {/each}
            {/if}
            <Button
                text
                disabled={prefs?.length && prefs[prefs.length - 1][0] && prefs[prefs.length - 1][1]
                    ? false
                    : true}
                on:click={() => {
                    if (prefs[prefs.length - 1][0] && prefs[prefs.length - 1][1]) {
                        prefs.push(['', '']);
                        prefs = prefs;
                    }
                }}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Add preference</span>
            </Button>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={arePrefsDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

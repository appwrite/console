<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormItem, FormItemPart, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { team } from './store';
    import { page } from '$app/stores';

    $: if (prefs) {
        if (JSON.stringify(prefs) !== JSON.stringify(Object.entries($team.prefs))) {
            if (!!prefs[prefs.length - 1][0] && !!prefs[prefs.length - 1][1]) {
                arePrefsDisabled = false;
            } else {
                arePrefsDisabled = true;
            }
        } else {
            arePrefsDisabled = true;
        }
    }

    let prefs: [string, string][] = null;
    let arePrefsDisabled = true;

    onMount(async () => {
        prefs = Object.entries($team.prefs as Record<string, string>);
        if (!prefs?.length) {
            prefs.push(['', '']);
        }
    });

    async function updatePrefs() {
        try {
            let updatedPrefs = Object.fromEntries(prefs);

            await sdk
                .forProject($page.params.region, $page.params.project)
                .teams.updatePrefs($team.$id, updatedPrefs);
            await invalidate(Dependencies.TEAM);
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
        <p>
            You can update your team's preferences by storing shared information on the teams's
            objects so they can easily be shared across members.
        </p>
        <svelte:fragment slot="aside">
            <form class="form u-grid u-gap-16">
                <ul class="form-list">
                    {#if prefs}
                        {#each prefs as [key, value], index}
                            <FormItem isMultiple>
                                <InputText
                                    id={`key-${index}`}
                                    isMultiple
                                    fullWidth
                                    bind:value={key}
                                    placeholder="Enter key"
                                    label="Key"
                                    required />

                                <InputText
                                    id={`value-${index}`}
                                    isMultiple
                                    fullWidth
                                    bind:value
                                    placeholder="Enter value"
                                    label="Value"
                                    required />
                                <FormItemPart alignEnd>
                                    <Button
                                        text
                                        disabled={(!key || !value) && index === 0}
                                        on:click={() => {
                                            if (index === 0) {
                                                prefs = [['', '']];
                                            } else {
                                                prefs.splice(index, 1);
                                                prefs = prefs;
                                            }
                                        }}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </FormItemPart>
                            </FormItem>
                        {/each}
                    {/if}
                </ul>
                <Button
                    noMargin
                    text
                    disabled={prefs?.length &&
                    prefs[prefs.length - 1][0] &&
                    prefs[prefs.length - 1][1]
                        ? false
                        : true}
                    on:click={() => {
                        if (prefs[prefs.length - 1][0] && prefs[prefs.length - 1][1]) {
                            prefs.push(['', '']);
                            prefs = prefs;
                        }
                    }}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add Preference</span>
                </Button>
            </form>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={arePrefsDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

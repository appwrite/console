<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';

    $: if (prefs) {
        if (JSON.stringify(prefs) !== JSON.stringify(Object.entries($user.prefs))) {
            if (!!prefs[prefs.length - 1][0] && !!prefs[prefs.length - 1][1]) {
                arePrefsDisabled = false;
            } else {
                arePrefsDisabled = true;
            }
        } else {
            arePrefsDisabled = true;
        }
    }

    let prefs: [string, unknown][] = null;
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
            invalidate(Dependencies.USER);
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
        <Heading tag="h6" size="7">User Preferences</Heading>
        <p>
            You can update your user preferences by storing information on the user's objects so
            they can easily be shared across devices and sessions.
        </p>
        <svelte:fragment slot="aside">
            <form class="form u-grid u-gap-16">
                <ul class="form-list">
                    {#if prefs}
                        {#each prefs as [key, value], index}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <label class="label" for={`key-${index}`}>Key</label>
                                    <div class="input-text-wrapper">
                                        <input
                                            id={`key-${key}`}
                                            placeholder="Enter key"
                                            type="text"
                                            class="input-text"
                                            bind:value={key} />
                                    </div>
                                </div>
                                <div class="form-item-part u-stretch">
                                    <label class="label" for={`value-${index}`}> Value </label>
                                    <div class="input-text-wrapper">
                                        <input
                                            id={`value-${value}`}
                                            placeholder="Enter value"
                                            type="text"
                                            class="input-text"
                                            bind:value />
                                    </div>
                                </div>
                                <div class="form-item-part u-cross-child-end">
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
                                </div>
                            </li>
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

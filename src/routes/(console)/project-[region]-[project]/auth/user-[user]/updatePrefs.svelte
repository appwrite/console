<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { user } from './store';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';
    import deepEqual from 'deep-equal';
    import type { PrefRow } from '$lib/helpers/prefs';
    import {
        normalizePrefs,
        createPrefRow,
        isAddDisabled,
        sanitizePrefs
    } from '$lib/helpers/prefs';

    $: if (prefs) {
        const currentNormalized = normalizePrefs(prefs);
        const originalNormalized = normalizePrefs(Object.entries($user.prefs));

        arePrefsDisabled = deepEqual(currentNormalized, originalNormalized);
    }

    let prefs: PrefRow[] = null;
    let arePrefsDisabled = true;

    onMount(async () => {
        const entries = Object.entries($user.prefs);
        prefs =
            entries.length > 0
                ? entries.map(([key, value]) => createPrefRow(key, value))
                : [createPrefRow()];
    });

    async function updatePrefs() {
        try {
            const sanitizedPrefs = sanitizePrefs(prefs);

            const updatedPrefs =
                sanitizedPrefs.length === 0
                    ? {}
                    : Object.fromEntries(sanitizedPrefs.map((pref) => [pref.key, pref.value]));

            await sdk
                .forProject(page.params.region, page.params.project)
                .users.updatePrefs({ userId: $user.$id, prefs: updatedPrefs });
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
        <svelte:fragment slot="title">Preferences</svelte:fragment>
        Add custom user preferences to share them across devices and sessions.
        <svelte:fragment slot="aside">
            {#if prefs}
                {#each prefs as pref, index (index)}
                    <Layout.Stack direction="row" alignItems="flex-end">
                        <InputText
                            id={`key-${index}`}
                            bind:value={pref.key}
                            on:input={() => {
                                prefs = [...prefs];
                            }}
                            placeholder="Enter key"
                            label={index === 0 ? 'Key' : undefined}
                            required />
                        <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                            <InputText
                                id={`value-${index}`}
                                bind:value={pref.value}
                                on:input={() => {
                                    prefs = [...prefs];
                                }}
                                placeholder="Enter value"
                                label={index === 0 ? 'Value' : undefined}
                                required />
                            <Button
                                icon
                                compact
                                disabled={(!pref.key || !pref.value) && index === 0}
                                on:click={() => {
                                    prefs.splice(index, 1);
                                    prefs = [...prefs];
                                }}>
                                <span class="icon-x" aria-hidden="true"></span>
                            </Button>
                        </Layout.Stack>
                    </Layout.Stack>
                {/each}
            {/if}
            <div>
                <Button
                    secondary
                    disabled={isAddDisabled(prefs)}
                    on:click={() => {
                        if (!prefs) return;
                        prefs = [...prefs, createPrefRow()];
                    }}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add preference
                </Button>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={arePrefsDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

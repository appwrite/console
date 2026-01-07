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

    type PrefRow = { id: string; key: string; value: string };

    $: if (prefs) {
        const normalize = (entries: [string, string][] | PrefRow[]) =>
            entries
                .map(item => Array.isArray(item) ? item : [item.key, item.value])
                .filter(([k, v]: [string, string]) => k.trim() && v.trim())
                .sort(([a]: [string, string], [b]: [string, string]) => a.localeCompare(b));

        const currentNormalized = normalize(prefs);
        const originalNormalized = normalize(Object.entries($user.prefs));

        arePrefsDisabled = JSON.stringify(currentNormalized) === JSON.stringify(originalNormalized);
    }

    let prefs: PrefRow[] = null;
    let arePrefsDisabled = true;
    let nextId = 0;

    function createPrefRow(key = '', value = ''): PrefRow {
        return { id: `pref-${nextId++}`, key, value };
    }

    onMount(async () => {
        const entries = Object.entries($user.prefs);
        prefs = entries.length > 0
            ? entries.map(([key, value]) => createPrefRow(key, value))
            : [createPrefRow()];
    });

    async function updatePrefs() {
        try {
            const sanitizedPrefs = prefs.filter(
                pref => pref.key.trim() !== '' && pref.value.trim() !== ''
            );

            const updatedPrefs = sanitizedPrefs.length === 0
                ? {}
                : Object.fromEntries(sanitizedPrefs.map(pref => [pref.key, pref.value]));

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
                {#each prefs as pref, index (pref.id)}
                    <Layout.Stack direction="row" alignItems="flex-end">
                        <InputText
                            id={`key-${index}`}
                            value={pref.key}
                            on:input={(e) => {
                                prefs[index].key = e.target.value;
                                prefs = [...prefs];
                            }}
                            placeholder="Enter key"
                            label={index === 0 ? 'Key' : undefined}
                            required />
                        <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                            <InputText
                                id={`value-${index}`}
                                value={pref.value}
                                on:input={(e) => {
                                    prefs[index].value = e.target.value;
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
                    disabled={prefs?.length &&
                    prefs[prefs.length - 1].key &&
                    prefs[prefs.length - 1].value
                        ? false
                        : true}
                    on:click={() => {
                        if (prefs[prefs.length - 1].key && prefs[prefs.length - 1].value) {
                            prefs = [...prefs, createPrefRow()];
                        }
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

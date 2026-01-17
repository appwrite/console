<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { team } from './store';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';
    import deepEqual from 'deep-equal';

    type PrefRow = { key: string; value: string };

    function normalize(entries: [string, string][] | PrefRow[]): [string, string][] {
        return entries
            .map(item => Array.isArray(item) ? item : [item.key, item.value])
            .filter(([k, v]: [string, string]) => k.trim() && v.trim())
            .sort(([a]: [string, string], [b]: [string, string]) => a.localeCompare(b));
    }

    $: if (prefs) {
        const currentNormalized = normalize(prefs);
        const originalNormalized = normalize(Object.entries($team.prefs as Record<string, string>));

        arePrefsDisabled = deepEqual(currentNormalized, originalNormalized);
    }

    let prefs: PrefRow[] = null;
    let arePrefsDisabled = true;

    function createPrefRow(key = '', value = ''): PrefRow {
        return {key, value };
    }

    onMount(async () => {
        const entries = Object.entries($team.prefs as Record<string, string>);
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
                .teams.updatePrefs({ teamId: $team.$id, prefs: updatedPrefs });
            await invalidate(Dependencies.TEAM);
            arePrefsDisabled = true;

            addNotification({
                message: 'Preferences have been updated',
                type: 'success'
            });
            trackEvent(Submit.TeamUpdatePreferences);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TeamUpdatePreferences);
        }
    }
</script>

<Form onSubmit={updatePrefs}>
    <CardGrid>
        <svelte:fragment slot="title">Preferences</svelte:fragment>
        You can update your team's preferences by storing shared information on the teams's objects so
        they can easily be shared across members.
        <svelte:fragment slot="aside">
            {#if prefs}
                {#each prefs as pref, index (index)}
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
                    disabled={
                        !!prefs &&
                        prefs.length > 0 &&
                        !(prefs[prefs.length - 1].key && prefs[prefs.length - 1].value)
                    }
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

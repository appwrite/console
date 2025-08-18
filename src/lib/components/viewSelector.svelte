<script lang="ts">
    import type { Writable } from 'svelte/store';
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import { Icon, Button } from '@appwrite.io/pink-svelte';
    import { IconViewBoards } from '@appwrite.io/pink-icons-svelte';
    import ViewToggle from './viewToggle.svelte';
    import ColumnSelector from './columnSelector.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { preferences } from '$lib/stores/preferences';
    import { page } from '$app/state';
    import { hash } from '$lib/helpers/string';

    interface Props {
        onlyIcon?: boolean;
        ui?: 'legacy' | 'new';
        columns: Writable<Column[]>;
        view: View;
        isCustomTable?: boolean;
        hideView?: boolean;
        hideColumns?: boolean;
        allowNoColumns?: boolean;
        showAnyway?: boolean;
    }

    let {
        onlyIcon = false,
        ui = 'legacy',
        columns,
        view = $bindable(),
        isCustomTable = false,
        hideView = false,
        hideColumns = false,
        allowNoColumns = false,
        showAnyway = false
    }: Props = $props();

    let showCountBadge = $state(false);
    const preferenceKey = $derived(getPreferenceKey());

    function getPreferenceKey(): string {
        const tableId = page.params.table;
        const organizationId = page.data.organization?.$id ?? page.data.project?.teamId;
        return hash([organizationId, tableId].filter(Boolean).join('#'));
    }

    function updateBadgeState() {
        if (!preferences.getKey(preferenceKey, false)) {
            showCountBadge = true;
            preferences.setKey(preferenceKey, true);
        }
    }

    $effect(() => {
        showCountBadge = !onlyIcon || !!preferences.getKey(preferenceKey, false);
    });
</script>

{#if !hideColumns && view === View.Table}
    <ColumnSelector
        {ui}
        {columns}
        {showAnyway}
        {isCustomTable}
        {allowNoColumns}
        onPreferencesUpdated={updateBadgeState}>
        {#snippet children(toggle, selectedColumnsNumber)}
            <Button.Button
                size="s"
                icon={onlyIcon}
                onclick={toggle}
                variant="secondary"
                disabled={!$columns.length && showAnyway}
                class={onlyIcon && !$isSmallViewport ? 'width-fix' : undefined}
                badge={showCountBadge ? selectedColumnsNumber.toString() : undefined}>
                <Icon slot="start" icon={IconViewBoards} />
            </Button.Button>
        {/snippet}
    </ColumnSelector>
{/if}

{#if !hideView}
    <ViewToggle bind:view />
{/if}

<style>
    :global(.width-fix) {
        width: 32px;
        height: 32px;
    }
</style>

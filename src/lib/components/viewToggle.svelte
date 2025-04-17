<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import type { View } from '$lib/helpers/load';
    import { preferences } from '$lib/stores/preferences';
    import { IconViewGrid, IconViewList } from '@appwrite.io/pink-icons-svelte';
    import { ToggleButton } from '@appwrite.io/pink-svelte';

    let {
        view = $bindable()
    }: {
        view: View;
    } = $props();

    function onViewChange(event: CustomEvent<View>) {
        updateViewPreferences(event.detail);
        goto(getViewLink(event.detail), {
            replaceState: true
        });
    }

    function getViewLink(view: View): string {
        const url = new URL(page.url);
        url.searchParams.set('view', view);
        return url.toString();
    }

    function updateViewPreferences(view: View) {
        preferences.setView(view);
    }
</script>

<ToggleButton
    --bgcolor-neutral-default="var(--bgcolor-neutral-primary)"
    on:change={onViewChange}
    active={view}
    buttons={[
        {
            id: 'table',
            label: 'table view',
            icon: IconViewList
        },
        {
            id: 'grid',
            label: 'grid view',
            icon: IconViewGrid
        }
    ]} />

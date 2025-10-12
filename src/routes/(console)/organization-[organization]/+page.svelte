<script lang="ts">
    import { resolvedProfile } from '$lib/profiles/index.svelte';
    import type { Component } from 'svelte';
    import View from './view.svelte';
    import ViewStudio from './viewStudio.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const map: Record<typeof resolvedProfile.id, Component> = {
        console: View,
        studio: ViewStudio
    };
    const ViewComponent = map[resolvedProfile.id];
</script>

<ViewComponent {data} />

<script lang="ts" module>
    export type { AttachOptions } from './studio-widget';
</script>

<script lang="ts">
    import './shim.css';
    import { onMount } from 'svelte';
    import { ensureStudioComponent, initImagine } from './studio-widget';
    import { app } from '$lib/stores/app';
    import { changeTheme } from '@imagine.dev/web-components/web-components';

    const { region, projectId }: { region: string; projectId: string } = $props();

    onMount(() => {
        ensureStudioComponent();
        initImagine(region, projectId);

        return app.subscribe(($app) => {
            changeTheme($app.themeInUse);
        });
    });
</script>

<div aria-hidden="true" style:display="none"></div>

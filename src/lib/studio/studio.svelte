<script lang="ts" module>
    export type { AttachOptions } from './studio-widget';
</script>

<script lang="ts">
    import './shim.css';
    import { onMount } from 'svelte';
    import { ensureStudioComponent, initImagine, getWebComponents } from './studio-widget';
    import { app } from '$lib/stores/app';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const { region, projectId }: { region: string; projectId: string } = $props();

    onMount(() => {
        ensureStudioComponent();

        initImagine(region, projectId);

        return app.subscribe(async ($app) => {
            const { changeTheme, initImagineCallbacks } = await getWebComponents();

            try {
                if (changeTheme) {
                    changeTheme($app.themeInUse);
                }

                if (initImagineCallbacks) {
                    initImagineCallbacks({
                        onProjectNameChange: () => {
                            invalidate(Dependencies.PROJECT);
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to change theme:', error);
            }
        });
    });
</script>

<div aria-hidden="true" style:display="none"></div>

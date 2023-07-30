<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Cover, CoverTitle } from '$lib/layout';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>{$LL.console.project.title.functions()}</CoverTitle>
    </svelte:fragment>
</Cover>

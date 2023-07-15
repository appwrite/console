<script lang="ts">
    import { Cover, CoverTitle } from '$lib/layout';
    import LL from '$i18n/i18n-svelte';
</script>

<Cover size="large">
    <CoverTitle>{$LL.console.onboarding.title.coverTitle()}</CoverTitle>
</Cover>

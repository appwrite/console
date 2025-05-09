<script lang="ts">
    import noFrameworkIcon from './noFrameworkIcon.svg';
    import noFrameworkIconDark from './noFrameworkIconDark.svg';
    import { app } from '$lib/stores/app';
</script>

{#if $app.themeInUse === 'light'}
    <img src={noFrameworkIcon} alt="" />
{:else}
    <img src={noFrameworkIconDark} alt="" />
{/if}

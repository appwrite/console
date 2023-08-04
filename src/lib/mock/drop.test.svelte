<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { DropList } from '$lib/components';

    export let show = false;
</script>

<DropList bind:show>
    <button id="button" on:click={() => (show = !show)}>{$LL.console.project.button.test()}</button>

    <svelte:fragment slot="list"
        ><li id="list">{$LL.console.project.mock.list()}</li></svelte:fragment>
    <svelte:fragment slot="other"
        ><span id="other">{$LL.console.project.mock.other()}</span></svelte:fragment>
</DropList>

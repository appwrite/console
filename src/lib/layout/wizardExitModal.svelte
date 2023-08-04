<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    const dispatch = createEventDispatcher();

    function handleSubmit() {
        dispatch('exit');
    }
</script>

<Modal bind:show onSubmit={handleSubmit} icon="exclamation" state="warning">
    <svelte:fragment slot="header">{$LL.console.project.title.exitProcess()}</svelte:fragment>
    <p>
        {$LL.console.project.texts.wizardExitModle.areYouSure()}
        <slot />? {$LL.console.project.texts.wizardExitModle.dataDelete()}
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit>{$LL.console.project.button.exit()}</Button>
    </svelte:fragment>
</Modal>

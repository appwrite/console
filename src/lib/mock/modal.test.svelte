<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Modal } from '../components';

    export let show = false;
</script>

<Modal bind:show>
    <span>{$LL.console.project.mock.content()}</span>
</Modal>

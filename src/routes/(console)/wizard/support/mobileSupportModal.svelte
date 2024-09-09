<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Support } from '$lib/components';
    import Modal from '$lib/components/modal.svelte';

    export let show: boolean;

    beforeNavigate(() => {
        show = false;
    });
</script>

<Modal title="Contact us" bind:show>
    <Support />
</Modal>

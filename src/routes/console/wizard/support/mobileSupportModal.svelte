<script lang="ts">
    import { Support } from '$lib/components';
    import Modal from '$lib/components/modal.svelte';

    export let show: boolean;
</script>

<Modal title="Contact us" bind:show>
    <Support />
</Modal>

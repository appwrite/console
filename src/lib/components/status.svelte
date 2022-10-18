<script lang="ts">
    export let status: string = null;
</script>

<div
    class="status"
    class:is-pending={status === 'pending'}
    class:is-failed={status === 'failed'}
    class:is-complete={status === 'complete' || status === 'ready'}
    class:is-processing={status === 'processing' || status === 'building'}>
    {#if status}
        <span class="status-icon" />
    {/if}
    <span class="text u-margin-inline-end-16"><slot /></span>
</div>

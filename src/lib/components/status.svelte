<script lang="ts">
    export let status:
        | 'waiting'
        | 'pending'
        | 'failed'
        | 'complete'
        | 'processing'
        | 'ready'
        | 'building'
        | string = null;

    //TODO: Remove type string once SDK is updated
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

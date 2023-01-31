<script lang="ts">
    export let status:
        | 'waiting'
        | 'pending'
        | 'failed'
        | 'completed'
        | 'processing'
        | 'ready'
        | 'building'
        | string
        | null = null;

    //TODO: Remove type string once SDK is updated
</script>

<div
    class="status"
    class:is-pending={status === 'pending'}
    class:is-failed={status === 'failed'}
    class:is-complete={status === 'completed' || status === 'ready'}
    class:is-processing={status === 'processing' || status === 'building'}>
    {#if status}
        <span class="status-icon" />
    {/if}
    <span class="text"><slot /></span>
</div>

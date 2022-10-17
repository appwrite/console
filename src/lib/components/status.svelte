<script lang="ts">
    export let status: 'waiting' | 'pending' | 'failed' | 'complete' | 'processing' | string = null;

    //TODO: remove string type after types are fixed
</script>

<div
    class="status"
    class:is-pending={status === 'pending'}
    class:is-failed={status === 'failed'}
    class:is-complete={status === 'complete'}
    class:is-processing={status === 'processing'}>
    {#if status}
        <span class="status-icon" />
    {/if}
    <span class="text u-margin-inline-end-16"><slot /></span>
</div>

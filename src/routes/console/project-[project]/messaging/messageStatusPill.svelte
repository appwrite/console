<script lang="ts">
    import { Pill } from '$lib/elements';

    export let status: string;
</script>

<Pill
    success={status === 'sent'}
    info={status === 'scheduled'}
    button={status == 'failed'}
    on:click>
    {#if status === 'sent'}
        <span class="icon-check-circle" aria-hidden="true"></span>
    {:else if status === 'scheduled'}
        <span class="icon-clock" aria-hidden="true"></span>
    {/if}
    <span class="text u-trim">
        {status}
    </span>
</Pill>

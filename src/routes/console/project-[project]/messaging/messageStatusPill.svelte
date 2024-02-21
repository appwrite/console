<script lang="ts">
    import { Pill } from '$lib/elements';

    export let status: string;
</script>

<Pill
    info={status === 'scheduled'}
    warning={status === 'processing'}
    success={status === 'sent'}
    danger={status === 'failed'}
    on:click>
    <span class="text u-trim">
        {status}
    </span>
</Pill>

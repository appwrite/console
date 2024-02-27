<script lang="ts">
    import { Pill } from '$lib/elements';

    export let enabled: boolean;

    $:style = `color: ${enabled ? 'hsl(var(--color-success-100))' : 'hsl(var(--color-danger-100))'}`;
    $:iconClass = (enabled ? 'icon-check-circle' : 'icon-exclamation-circle') + ' u-font-size-12';
</script>

<Pill success={enabled} danger={!enabled} on:click>
    <span class="text u-font-size-12 u-trim">
        <span class={iconClass} aria-hidden="true" {style} />

        <span>{enabled ? 'enabled' : 'stopped'}</span>
    </span>
</Pill>

<script lang="ts">
    import { Pill } from '$lib/elements';

    export let enabled:boolean;

    const style = `color: ${enabled ? "hsl(var(--color-success-100))" : "hsl(var(--color-danger-100))"}`;
    const iconClass = enabled ? "icon-check-circle" : "icon-exclamation-circle";
</script>

<Pill
    success={enabled}
    danger={!enabled}
    on:click>
    <span class="text u-font-size-12 u-trim">
      <span
      class={`${iconClass} u-font-size-12`}
      aria-hidden="true"
      style={style} />
  
      <span>{enabled ? "enabled" : "stopped"}</span>
</span>
</Pill>

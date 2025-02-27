<script lang="ts">
    export let alternativeTrim = false;
</script>

<span class={`text ${alternativeTrim ? 'u-trim-1' : 'u-trim'}`}>
    <slot />
</span>

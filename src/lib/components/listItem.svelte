<script lang="ts">
    export let icon: string = null;
</script>

<li class="list-item">
    <span class={icon ? `icon-${icon}` : 'icon-check-circle'} aria-hidden="true"></span>
    <slot />
</li>

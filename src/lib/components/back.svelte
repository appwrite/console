<script lang="ts">
    export let href: string;
</script>

<a {href}>
    <span class="icon-cheveron-left" aria-hidden="true" />
    <slot />
</a>

<script lang="ts">
    export let href: string;
</script>

<a class="table-row" role="row" {href}>
    <slot />
</a>

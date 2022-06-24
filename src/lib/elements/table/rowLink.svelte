<script lang="ts">
    export let href: string;
</script>

<a class="table-row" role="row" {href}>
    <slot />
</a>

<style>
    a.table-row {
        display: table-row;

        /** JUST FOR DEMONSTRATION */
        opacity: 0.75;
    }

    a.table-row:hover {
        /** JUST FOR DEMONSTRATION */
        opacity: 1;
    }
</style>

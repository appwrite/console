<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';

    $: breadcrumbs = [
        {
            href: `/console`,
            title: 'Console'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

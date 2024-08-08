<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { user } from '$lib/stores/user';

    $: breadcrumbs = [
        {
            href: `${base}/account`,
            title: $user?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

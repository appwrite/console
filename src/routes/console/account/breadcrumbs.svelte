<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { user } from '$lib/stores/user';

    $: breadcrumbs = [
        {
            href: `/console/account`,
            title: $user.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

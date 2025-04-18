<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { database } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: `${base}/project-${page.data.project.$id}`,
            title: page.data.project.name
        },
        {
            href: `${base}/project-${page.data.project.$id}/databases`,
            title: 'Databases'
        },
        {
            href: `${base}/project-${page.data.project.$id}/databases/database-${$database.$id}`,
            title: $database.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { database } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: getProjectRoute(),
            title: page.data.project.name
        },
        {
            href: getProjectRoute('/databases'),
            title: 'Databases'
        },
        {
            href: getProjectRoute(`/databases/database-${$database.$id}`),
            title: $database.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

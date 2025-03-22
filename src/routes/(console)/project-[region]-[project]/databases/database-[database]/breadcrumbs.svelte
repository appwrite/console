<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { database } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}`,
            title: $page.data.project.name
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/databases`,
            title: 'Databases'
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${$database.$id}`,
            title: $database.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

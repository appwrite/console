<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$page.data.organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/databases`,
            title: 'Databases'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

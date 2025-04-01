<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${page.data.organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${page.data.project?.$id}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${page.data.project?.$id}/databases`,
            title: 'Databases'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

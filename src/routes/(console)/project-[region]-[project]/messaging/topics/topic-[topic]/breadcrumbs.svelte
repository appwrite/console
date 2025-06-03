<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { topic } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: `${base}/project-${$project.region}-${$project.$id}`,
            title: $project.name
        },
        {
            href: `${base}/project-${$project.region}-${$project.$id}/messaging`,
            title: 'Messaging'
        },
        {
            href: `${base}/project-${$project.region}-${$project.$id}/messaging/topics/topic-${$topic?.$id}`,
            title: $topic?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '$routes/console/project-[project]/store';
    import { topic } from './store';

    $: breadcrumbs = [
        {
            href: `/console/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: `/console/project-${$project.$id}`,
            title: $project.name
        },
        {
            href: `/console/project-${$project.$id}/messaging`,
            title: 'Messaging'
        },
        {
            href: `/console/project-${$project.$id}/messaging/topics/topic-${$topic?.$id}`,
            title: $topic?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { message } from './store';

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
            title:
                $message.data.title ?? $message.data.subject ?? $message.data.content ?? 'Message'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

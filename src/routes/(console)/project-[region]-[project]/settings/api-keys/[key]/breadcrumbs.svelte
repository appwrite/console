<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { key } from './store';

    const breadcrumbs = $derived([
        {
            href: resolve('/(console)/organization-[organization]', {
                organization: $organization?.$id
            }),
            title: $organization?.name
        },
        {
            href: resolve('/(console)/project-[region]-[project]', {
                region: page.params.region,
                project: page.params.project
            }),
            title: $project?.name
        },
        {
            href: resolve('/(console)/project-[region]-[project]/settings/api-keys', {
                region: page.params.region,
                project: page.params.project
            }),
            title: 'API keys'
        },
        {
            href: resolve('/(console)/project-[region]-[project]/settings/api-keys/[key]', {
                region: page.params.region,
                project: page.params.project,
                key: $key?.$id
            }),
            title: $key?.name
        }
    ]);
</script>

<Breadcrumbs {breadcrumbs} />

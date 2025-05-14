<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { func } from '../store';
    import { deployment } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/functions`,
            title: 'Functions'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${$func?.$id}`,
            title: $func?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${$func?.$id}/deployment-${$deployment?.$id}`,
            title: 'Deployment'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />

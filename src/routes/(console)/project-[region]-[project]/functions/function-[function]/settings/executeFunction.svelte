<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid, Heading, SvgIcon } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { func } from '../store';
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
        <div class="avatar" style={`--p-image-size: ${32 / 16}rem`} aria-hidden="true">
            <SvgIcon size={64} iconSize="large" name={$func.runtime.split('-')[0]}></SvgIcon>
        </div>
        <div class="u-flex-vertical u-gap-4">
            <Heading tag="h6" size="7">{$func.name}</Heading>

            <p class="text u-capitalize">{$func.runtime}</p>
        </div>
    </div>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div>
                <p>Created at: {toLocaleDateTime($func.$createdAt)}</p>
                <p>Last updated at: {toLocaleDateTime($func.$updatedAt)}</p>
            </div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            secondary
            href={`${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}>
            Execute
        </Button>
    </svelte:fragment>
</CardGrid>

<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { app } from '$lib/stores/app';
    import { execute, func } from '../store';
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
        <div class="avatar is-medium">
            <img
                src={`${base}/icons/${$app.themeInUse}/color/${$func.runtime.split('-')[0]}.svg`}
                alt="technology" />
        </div>
        <div>
            <Heading tag="h6" size="7">{$func.name}</Heading>

            <p class="text u-capitalize">{$func.runtime}</p>
        </div>
    </div>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div>
                <p>Function ID: {$func.$id}</p>
                <p>Created at: {toLocaleDateTime($func.$createdAt)}</p>
                <p>Updated at: {toLocaleDateTime($func.$updatedAt)}</p>
            </div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => ($execute = $func)}>Execute now</Button>
    </svelte:fragment>
</CardGrid>

<script>
    import { CardGrid } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { func } from '../store';
    // import { page } from '$app/stores';

    // const functionId = $page.params.function;
</script>

<Container>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
            <div class="avatar is-medium">
                <img
                    src={`${base}/icons/${$app.themeInUse}/color/${
                        $func.runtime.split('-')[0]
                    }.svg`}
                    alt="technology" />
            </div>
            <div>
                <h6 class="heading-level-7">{$func.name}</h6>
                <p>{$func.runtime}</p>
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
            <Button text on:click={() => console.log('open Logs')}>View as JSON</Button>
            <Button
                secondary
                on:click={() => {
                    console.log(`showExecute = true`);
                }}>Execute now</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

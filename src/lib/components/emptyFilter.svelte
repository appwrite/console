<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { EmptySearch } from '.';
    import { queries } from './filters';

    export let resource;
</script>

<EmptySearch hidePages>
    <div class="common-section">
        <div class="u-text-center common-section">
            <b class="body-text-2 u-bold">Sorry, we couldn't find any {resource}.</b>
            <p>There are no {resource} that match your filters.</p>
        </div>
        <div class="u-flex common-section u-main-center">
            <Button
                secondary
                on:click={() => {
                    queries.clearAll();
                    queries.apply();
                }}>
                Clear filters
            </Button>
        </div>
    </div>
</EmptySearch>

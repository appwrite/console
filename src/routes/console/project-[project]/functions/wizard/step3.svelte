<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Empty } from '$lib/components';
    import { createFunction } from './store';
    import Create from '../createEvent.svelte';

    let showCreate = false;
</script>

<WizardStep>
    <svelte:fragment slot="title">Events (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set the events that will trigger your function. Maximum 100 events allowed.
    </svelte:fragment>

    EVENT
    {#if $createFunction?.events?.length}
        <div class="table-with-scroll">
            <div class="table-wrapper">
                <div class="table is-remove-outer-styles">
                    <ul class="table-thead">
                        {#each $createFunction.events as id}
                            <li class="table-row">
                                <div class="table-col" data-title="id">
                                    <span class="text">{id}</span>
                                </div>
                                <div
                                    class="table-col u-overflow-visible"
                                    data-title="options"
                                    style="--p-col-width:40">
                                    <button
                                        class="button is-text is-only-icon"
                                        aria-label="delete id"
                                        on:click={() => {
                                            $createFunction.events = $createFunction.events.filter(
                                                (item) => item !== id
                                            );
                                            $createFunction = $createFunction;
                                        }}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </button>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
    {:else}
        <Empty dashed centered>Add a role to get started</Empty>
    {/if}

    <Button text on:click={() => (showCreate = !showCreate)}>
        <span class="icon-plus" aria-hidden="true" />
        <span class="u-text">Add event</span>
    </Button>
</WizardStep>

<Create {showCreate} />

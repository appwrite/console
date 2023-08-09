<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal, NumericList, NumericListItem } from '$lib/components';
    import { func } from './store';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    export let show = false;
</script>

<Modal size="big" bind:show headerDivider={false}>
    <svelte:fragment slot="header">Create git deployment</svelte:fragment>
    {#if $func.installationId && $func.providerRepositoryId}
        <p class="text">
            Deploy your function from the Git provider of your choice by following the steps below.
            Learn more in our <a
                href="https://appwrite.io/docs/functions-deployment"
                target="_blank"
                rel="noopener noreferrer"
                class="link">documentation</a
            >.
        </p>
        <div class="box">
            <NumericList>
                <NumericListItem>Checkout your production branch.</NumericListItem>
                <NumericListItem>Create a new commit</NumericListItem>
                <NumericListItem>Push your new commit</NumericListItem>
                <NumericListItem>A new deployment will be triggered automatically.</NumericListItem>
            </NumericList>
        </div>
    {:else}
        <div class="box">
            <div class="u-flex u-gap-16">
                <span class=" icon-lightning-bolt" aria-hidden="true" />
                <div class="alert-content" data-private>
                    <h6 class="alert-title">You can now deploy your functions with Git</h6>
                    <p class="alert-message">
                        To get started, install Git and connect a repository to your function. When
                        you push to that repository, your function will be deployed.
                    </p>
                    <div class="alert-buttons u-flex u-margin-inline-start-auto">
                        <Button text href="#/">Learn more</Button>
                        <Button
                            href={`${base}/console/project-${$page.params.project}/functions/function-${$page.params.function}/settings`}>
                            Install Git
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>

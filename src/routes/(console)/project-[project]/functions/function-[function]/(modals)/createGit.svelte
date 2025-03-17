<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Box, Code, Modal, NumericList, NumericListItem } from '$lib/components';
    import { func } from '../store';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    export let show = false;
</script>

<Modal title="Create Git deployment" bind:show>
    {#if $func.installationId && $func.providerRepositoryId}
        <p class="text">
            Deploy your function from the Git provider of your choice by following the steps below.
            Learn more in our <a
                href="https://appwrite.io/docs/products/functions/deployment"
                target="_blank"
                rel="noopener noreferrer"
                class="link">documentation</a
            >.
        </p>
        <NumericList>
            <NumericListItem fullWidth>
                <span class="text">Checkout your production branch.</span>
                <div class="u-margin-block-start-16">
                    <Code
                        language="sh"
                        withCopy
                        noMargin
                        noBoxPadding
                        code={`git checkout ${$func.providerBranch}`} />
                </div>
            </NumericListItem>
            <NumericListItem fullWidth>
                <span class="text"> Add your changes</span>
                <div class="u-margin-block-start-16">
                    <Code language="sh" withCopy noMargin noBoxPadding code={`git add .`} />
                </div>
            </NumericListItem>
            <NumericListItem fullWidth>
                <span class="text"> Create a new commit </span>
                <div class="u-margin-block-start-16 u-min-width-0 u-grid">
                    <Code
                        language="sh"
                        withCopy
                        noMargin
                        noBoxPadding
                        code={`git commit -m "deploying with Appwrite"`} />
                </div>
            </NumericListItem>
            <NumericListItem fullWidth>
                <span class="text"> Push your new commit</span>
                <div class="u-margin-block-start-16">
                    <Code
                        language="sh"
                        withCopy
                        noMargin
                        noBoxPadding
                        code={`git push ${$func.providerBranch}`} />
                </div>
            </NumericListItem>
            <NumericListItem>
                <span class="text"> A new deployment will be triggered automatically. </span>
            </NumericListItem>
        </NumericList>
    {:else}
        <Box>
            <div class="u-flex u-gap-16">
                <span class=" icon-lightning-bolt" aria-hidden="true" />
                <div class="alert-content" data-private>
                    <h6 class="alert-title">You can now deploy your functions with Git</h6>
                    <p class="alert-message">
                        To get started, install Git and connect a repository to your function. When
                        you push to that repository, your function will be deployed.
                    </p>
                    <div class="alert-buttons u-flex u-margin-inline-start-auto">
                        <Button
                            text
                            href="https://appwrite.io/docs/products/functions/deployment"
                            external>
                            Learn more
                        </Button>
                        <Button
                            href={`${base}/project-${$page.params.project}/functions/function-${$page.params.function}/settings`}>
                            Install Git
                        </Button>
                    </div>
                </div>
            </div>
        </Box>
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>

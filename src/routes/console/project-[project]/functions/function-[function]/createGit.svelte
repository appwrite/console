<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Box, Code, Modal, NumericList, NumericListItem } from '$lib/components';
    import { func } from './store';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    export let show = false;
</script>

<Modal title="Create git deployment" size="big" bind:show headerDivider={false}>
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
        <Box>
            <NumericList>
                <NumericListItem fullWidth>
                    <span class="text">Checkout your production branch.</span>
                    <div class="u-margin-block-start-16">
                        <Code
                            language="sh"
                            withCopy
                            noMargin
                            code={`git checkout ${$func.providerBranch}`} />
                    </div>
                </NumericListItem>
                <NumericListItem fullWidth>
                    <span class="text"> Create a new commit </span>
                    <div class="u-margin-block-start-16">
                        <Code
                            language="sh"
                            withCopy
                            noMargin
                            code={`git commit -m "deploying with Appwrite"`} />
                    </div>
                </NumericListItem>
                <NumericListItem fullWidth>
                    <span class="text"> Push your new commit </span>
                    <div class="u-margin-block-start-16">
                        <Code
                            language="sh"
                            withCopy
                            noMargin
                            code={`git push ${$func.providerBranch}`} />
                    </div>
                </NumericListItem>
                <NumericListItem>
                    <span class="text"> A new deployment will be triggered automatically. </span>
                </NumericListItem>
            </NumericList>
        </Box>
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
                        <!-- TODO: add link to docs -->
                        <Button text href="https://appwrite.io/docs/functions-deploy#vcs" external>Learn more</Button>
                        <Button
                            href={`${base}/console/project-${$page.params.project}/functions/function-${$page.params.function}/settings`}>
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

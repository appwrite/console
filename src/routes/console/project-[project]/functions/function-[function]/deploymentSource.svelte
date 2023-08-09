<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import type { Models } from '@appwrite.io/console';
    import { tick } from 'svelte';

    export let deployment: Models.Deployment;
    let tooltipContent: HTMLDivElement;
</script>

{#if deployment.type === 'vcs'}
    <span
        class="u-underline u-cursor-pointer"
        use:tooltip={{
            interactive: true,
            allowHTML: true,
            disabled: false,
            onShow(instance) {
                tick().then(() => {
                    instance.setContent(tooltipContent);
                });
            }
        }}><span class="icon-github" aria-hidden="true" /> Git</span>
{:else if deployment.type === 'manual'}
    <span class="icon-code" aria-hidden="true" /> <span>Manual</span>
{/if}

<div class="u-hide">
    <div bind:this={tooltipContent} class="u-flex u-flex-vertical u-gap-2">
        <span
            ><span class="icon-github" aria-hidden="true" />
            <a
                class="u-underline u-cursor-pointer"
                target="_blank"
                href={deployment.providerRepositoryUrl}
                >{deployment.providerRepositoryOwner}/{deployment.providerRepositoryName}</a
            ></span>
        <span
            ><span class="icon-git-branch" aria-hidden="true" />
            <a
                class="u-underline u-cursor-pointer"
                target="_blank"
                href={deployment.providerBranchUrl}>{deployment.providerBranch}</a
            ></span>
        <span
            ><span class="icon-git-commit" aria-hidden="true" />
            <a
                class="u-underline u-cursor-pointer"
                target="_blank"
                href={deployment.providerCommitUrl}
                >{deployment.providerCommitHash.substring(0, 7)}
                {deployment.providerCommitMessage}</a
            ></span>
    </div>
</div>

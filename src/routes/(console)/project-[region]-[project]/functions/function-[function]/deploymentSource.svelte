<script lang="ts">
    import { DropList, DropListLink, Trim } from '$lib/components';
    import type { Models } from '@appwrite.io/console';

    export let deployment: Models.Deployment;
    let showDropdown = false;
</script>

{#if deployment.type === 'vcs'}
    <DropList bind:show={showDropdown}>
        <button
            on:click={() => (showDropdown = !showDropdown)}
            type="button"
            class="u-flex u-gap-4 u-cross-center">
            <span class="icon-github" aria-hidden="true" /> <span class="link">GitHub</span>
        </button>
        <svelte:fragment slot="list">
            <DropListLink
                href={deployment.providerRepositoryUrl}
                external
                icon="github"
                iconStyle="font-size:20px">
                <Trim alternativeTrim>
                    <span style:white-space="pre-wrap">
                        {deployment.providerRepositoryOwner}/{deployment.providerRepositoryName}
                    </span>
                </Trim>
            </DropListLink>
            <DropListLink
                href={deployment.providerBranchUrl}
                external
                icon="git-branch"
                iconStyle="font-size:20px">
                {deployment.providerBranch}
            </DropListLink>
            {#if deployment?.providerCommitMessage && deployment?.providerCommitHash && deployment?.providerCommitUrl}
                <DropListLink
                    href={deployment.providerCommitUrl}
                    external
                    icon="git-commit"
                    iconStyle="font-size:20px">
                    <Trim alternativeTrim>
                        <span style="white-space: pre-wrap">
                            {deployment?.providerCommitHash?.substring(0, 7)}
                            {deployment.providerCommitMessage}
                        </span>
                    </Trim>
                </DropListLink>
            {/if}
        </svelte:fragment>
    </DropList>
{:else if deployment.type === 'manual'}
    <span class="icon-code" aria-hidden="true" /> <span>Manual</span>
{:else if deployment.type === 'cli'}
    <span class="icon-terminal" aria-hidden="true" /> <span>CLI</span>
{/if}

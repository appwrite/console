<script lang="ts">
    import { DropList, DropListLink, Trim } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { Models } from '@appwrite.io/console';

    export let domain: Models.ProxyRuleList;
    let showDropdown = false;
</script>

<div class="u-flex u-gap-4 u-cross-center">
    <a
        href={`http://${domain.rules[0].domain}`}
        target="_blank"
        class="u-flex u-gap-4 u-cross-center">
        <Trim alternativeTrim>
            <span class="link">
                {domain.rules[0].domain}
            </span>
        </Trim>
        <span class="icon-external-link" aria-hidden="true" />
    </a>
    {#if domain.rules.length > 1}
        <DropList bind:show={showDropdown} scrollable>
            <Pill button on:click={() => (showDropdown = !showDropdown)}>
                +{domain.rules.length - 1}
            </Pill>
            <svelte:fragment slot="list">
                {#each domain.rules as rule, i}
                    {#if i !== 0}
                        <DropListLink href={`http://${rule.domain}`} external icon="external-link">
                            {rule.domain}
                        </DropListLink>
                    {/if}
                {/each}
            </svelte:fragment>
        </DropList>
    {/if}
</div>

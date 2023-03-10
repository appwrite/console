<script lang="ts">
    import { Empty, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@aw-labs/appwrite-console';
    import Create from './create.svelte';
    import Delete from './delete.svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { ruleResource } from './wizard/store';

    export let rules: Models.ProxyRuleList;
    export let resourceType: string;
    export let resourceId: string;

    let showDelete = false;
    let selectedRule: Models.ProxyRule;
    let isVerifying = {};

    const openWizard = () => {
        $ruleResource = {
            type: resourceType,
            id: resourceId
        };

        wizard.start(Create);
    };

    const refreshDomain = async (rule: Models.ProxyRule) => {
        const ruleId = rule.$id;
        try {
            isVerifying[ruleId] = true;

            if (rule.status === 'verified') {
                invalidate(Dependencies.RULES);
                return;
            }

            await sdkForProject.proxy.updateRuleVerification(ruleId);
            invalidate(Dependencies.RULES);
            trackEvent('submit_domain_update_verification');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        } finally {
            isVerifying[ruleId] = false;
        }
    };
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Domains</Heading>

        <Button on:click={openWizard}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create domain</span>
        </Button>
    </div>
    {#if rules.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={200}>Domain Name</TableCellHead>
                <TableCellHead width={50}>Status</TableCellHead>
                <TableCellHead width={250} />
                <TableCellHead width={40}>Actions</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each rules.rules as rule}
                    <TableRow>
                        <TableCellText title="Domain">
                            <div class="u-flex u-flex-horizontal u-cross-center u-gap-4">
                                <p>{rule.domain}</p>
                                <div style="--p-button-size: var(--button-size, 2.0rem);">
                                    <a
                                        class="is-text is-only-icon button"
                                        href={`//${rule.domain}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        ><span class="icon-external-link" aria-hidden="true" /></a>
                                </div>
                            </div>
                        </TableCellText>
                        <TableCellText title="Status">
                            <Pill
                                warning={rule.status !== 'verified'}
                                success={rule.status === 'verified'}>
                                {rule.status}
                            </Pill>
                        </TableCellText>
                        <TableCell />

                        <TableCell title="Actions">
                            <div class="u-flex u-gap-8 u-cross-center u-main-end">
                                {#if rule.status === 'verifying' || isVerifying[rule.$id]}
                                    <!-- TODO: remove inline styles -->
                                    <div
                                        class="loader"
                                        style="color: hsl(var(--color-neutral-50)); inline-size: 1.25rem; block-size: 1.25rem" />
                                {:else if rule.status === 'failed' || rule.status === 'created'}
                                    <!-- TODO: remove inline styles -->
                                    <button
                                        class="button is-text is-only-icon u-padding-inline-0"
                                        style="--p-button-size: var(--button-size, 2.0rem);"
                                        aria-label="Verify item"
                                        on:click={() => refreshDomain(rule)}>
                                        <span class="icon-refresh" aria-hidden="true" />
                                    </button>
                                {/if}
                                <!-- TODO: remove inline styles -->
                                <button
                                    class="button tooltip is-text is-only-icon u-padding-inline-0"
                                    style="--p-button-size: var(--button-size, 2.0rem);"
                                    aria-label="Delete item"
                                    on:click={async () => {
                                        showDelete = true;
                                        selectedRule = rule;
                                    }}>
                                    <span class="icon-trash" aria-hidden="true" />
                                    <span class="tooltip-popup is-bottom" role="tooltip">
                                        Delete
                                    </span>
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/custom-domains"
            target="domain"
            on:click={openWizard} />
    {/if}
</Container>

<Delete bind:showDelete bind:selectedRule />

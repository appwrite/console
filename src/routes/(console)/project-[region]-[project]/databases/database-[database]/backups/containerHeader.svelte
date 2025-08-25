<script lang="ts">
    import { DropList } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { IconInfo, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { goto } from '$app/navigation';
    import { upgradeURL } from '$lib/stores/billing';
    import { BillingPlan } from '$lib/constants';
    import { organization } from '$lib/stores/organization';

    export let isFlex = true;
    export let title: string;

    export let buttonText: string = null;
    export let policiesCreated: number = 0;
    export let maxPolicies: number = 0;
    export let buttonMethod: () => void = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let buttonDisabled = false;
    export let buttonType: 'primary' | 'secondary' | 'text' = 'primary';

    let showDropdown = false;
</script>

<header
    class:is-disabled={buttonDisabled}
    class:u-flex={isFlex}
    class="u-gap-12 common-section u-main-space-between u-flex-wrap">
    <Layout.Stack
        direction="row"
        gap="m"
        alignContent="center"
        alignItems="center"
        justifyContent="space-between">
        <Layout.Stack direction="row" gap="xs">
            <Typography.Text variant="m-500">{title}</Typography.Text>
            {#if title === 'Policies'}
                <Badge size="xs" variant="secondary" content={policiesCreated.toString()} />
            {/if}
        </Layout.Stack>

        {#if title === 'Policies' && policiesCreated >= maxPolicies}
            <div style:height="40px;" style:padding-block-start="4px">
                <DropList
                    bind:show={showDropdown}
                    width="16"
                    noArrow
                    placement="bottom-start"
                    gap="6px"
                    paddingBlock="var(--space-5, 12px)"
                    paddingInline="var(--space-6, 16px)"
                    resetListPadding>
                    {#if $organization?.billingPlan === BillingPlan.PRO}
                        <Tag
                            size="s"
                            style="white-space: nowrap; max-width: none;"
                            on:click={() => (showDropdown = true)}>
                            <Icon icon={IconInfo} size="s" />
                            {policiesCreated}/{maxPolicies} created
                        </Tag>
                    {:else}
                        <Badge
                            style="white-space: nowrap; max-width: none;"
                            variant="secondary"
                            content={`${policiesCreated}/${maxPolicies} created`}
                            on:click={() => (showDropdown = true)}>
                            <Icon icon={IconInfo} size="s" slot="start" />
                        </Badge>
                    {/if}
                    <svelte:fragment slot="list">
                        <slot name="tooltip">
                            <span>
                                You are limited to {maxPolicies} policy on your plan.
                                <button
                                    class="u-underline"
                                    on:click={() => {
                                        showDropdown = !showDropdown;
                                        goto($upgradeURL);
                                    }}>Upgrade your plan</button> to add customized backup policies.
                            </span>
                        </slot>
                    </svelte:fragment>
                </DropList>
            </div>
        {/if}

        {#if title === 'Backups' || policiesCreated < maxPolicies}
            <Button
                event={buttonEvent}
                on:click={buttonMethod}
                disabled={buttonDisabled}
                text={buttonType === 'text'}
                secondary={buttonType === 'secondary'}>
                <Icon icon={IconPlus} slot="start" size="s" />
                {buttonText}
            </Button>
        {/if}
    </Layout.Stack>
</header>

<style>
    .is-disabled {
        opacity: 0.5;
    }
</style>

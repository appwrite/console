<script lang="ts">
    import { InputChoice, InputNumber } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { Card, Divider, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { CreditsApplied } from '.';
    import { sdk } from '$lib/stores/sdk';
    import { AppwriteException, type Models } from '@appwrite.io/console';
    import DiscountsApplied from './discountsApplied.svelte';

    type PlanChangeEstimate = Models.EstimationUpdatePlan & Partial<Models.EstimationPlanChange>;

    export let billingPlan: Models.BillingPlan;
    export let collaborators: string[];
    export let couponData: Partial<Models.Coupon>;
    export let billingBudget: number;
    export let fixedCoupon = false; // If true, the coupon cannot be removed
    export let isDowngrade = false;
    export let organizationId: string | undefined = undefined;
    export let estimationOverride: PlanChangeEstimate | null = null;
    export let preferExternalEstimate = false;

    let budgetEnabled = false;
    let estimation: Models.Estimation | PlanChangeEstimate;

    function getEstimateDetails(value: Models.Estimation | PlanChangeEstimate) {
        if (!value) return null;

        return 'estimation' in value && value.estimation ? value.estimation : value;
    }

    function normalizeItems(items: unknown): Models.EstimationItem[] {
        if (!items) return [];

        if (Array.isArray(items)) {
            return items as Models.EstimationItem[];
        }

        if (typeof items === 'object') {
            return Object.values(items as Record<string, Models.EstimationItem>);
        }

        return [];
    }

    async function getEstimate(
        billingPlan: string,
        collaborators: string[],
        couponId: string | undefined
    ) {
        try {
            estimation = await sdk.forConsole.organizations.estimationCreateOrganization({
                billingPlan,
                invites: collaborators ?? [],
                couponId: couponId === '' ? null : couponId
            });
        } catch (e) {
            if (e instanceof AppwriteException) {
                if (
                    e.type === 'billing_coupon_not_found' ||
                    e.type === 'billing_coupon_already_used' ||
                    e.type === 'billing_credit_unsupported' ||
                    e.type === 'billing_coupon_not_eligible'
                ) {
                    couponData = {
                        code: null,
                        status: null,
                        credits: null
                    };
                }
            }
        }
    }

    async function getUpdatePlanEstimate(
        organizationId: string,
        billingPlan: string,
        collaborators: string[],
        couponId: string | undefined
    ) {
        try {
            estimation = await sdk.forConsole.organizations.estimationUpdatePlan({
                organizationId,
                billingPlan: billingPlan,
                invites: collaborators ?? [],
                couponId: couponId && couponId.length > 0 ? couponId : null
            });
        } catch (e) {
            if (e instanceof AppwriteException) {
                if (
                    e.type === 'billing_coupon_not_found' ||
                    e.type === 'billing_coupon_already_used' ||
                    e.type === 'billing_credit_unsupported' ||
                    e.type === 'billing_coupon_not_eligible'
                ) {
                    couponData = {
                        code: null,
                        status: null,
                        credits: null
                    };
                }
            }
        }
    }

    $: if (estimationOverride) {
        estimation = estimationOverride;
    } else if (preferExternalEstimate) {
        estimation = undefined;
    } else if (organizationId) {
        getUpdatePlanEstimate(organizationId, billingPlan.$id, collaborators, couponData?.code);
    } else {
        getEstimate(billingPlan.$id, collaborators, couponData?.code);
    }
</script>

{#if estimation}
    {@const estimationDetails = getEstimateDetails(estimation)}
    <Card.Base padding="s">
        <Layout.Stack>
            <slot />

            {#each normalizeItems(estimationDetails?.items) as item}
                <Layout.Stack direction="row" justifyContent="space-between">
                    <Typography.Text variant={isDowngrade ? 'm-500' : 'm-400'}
                        >{item.label}</Typography.Text>
                    <Typography.Text variant={isDowngrade ? 'm-500' : 'm-400'}
                        >{formatCurrency(item.value)}</Typography.Text>
                </Layout.Stack>
            {/each}
            {#each normalizeItems(estimationDetails?.discounts) as item}
                <DiscountsApplied {couponData} {...item} />
            {/each}

            {#if couponData?.status === 'active'}
                <CreditsApplied bind:couponData {fixedCoupon} />
            {/if}

            <Divider />
            <Layout.Stack direction="row" justifyContent="space-between">
                <Typography.Text>Total due</Typography.Text>
                <Typography.Text>
                    {formatCurrency(estimationDetails?.grossAmount ?? 0)}
                </Typography.Text>
            </Layout.Stack>

            <Typography.Text>
                You'll pay <b>{formatCurrency(estimationDetails?.grossAmount ?? 0)}</b>
                now.
                {#if couponData?.code}Once your credits run out,{:else}Then{/if} you'll be charged
                <b>{formatCurrency(estimationDetails?.amount ?? 0)}</b> every 30 days.
            </Typography.Text>

            <InputChoice
                type="switchbox"
                id="budget"
                label="Enable budget cap"
                tooltip="If enabled, you will be notified when your spending reaches 75% of the set cap. Update cap alerts in your organization settings."
                fullWidth
                bind:value={budgetEnabled}>
                {#if budgetEnabled}
                    <div class="u-margin-block-start-16">
                        <InputNumber
                            required
                            autofocus
                            id="budget"
                            label="Budget cap (USD)"
                            placeholder="0"
                            min={0}
                            bind:value={billingBudget} />
                    </div>
                {/if}
            </InputChoice>
        </Layout.Stack>
    </Card.Base>
{/if}

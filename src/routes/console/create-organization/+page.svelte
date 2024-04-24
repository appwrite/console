<script lang="ts">
    import { base } from '$app/paths';
    import { LabelCard } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Button, Form, FormList, InputText, Label } from '$lib/elements/forms';
    import { formatCurrency } from '$lib/helpers/numbers';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter,
        WizardSecondaryHeader
    } from '$lib/layout';
    import { plansInfo, tierFree, tierPro } from '$lib/stores/billing';
    import { organizationList, type Organization } from '$lib/stores/organization';
    import { createOrganization } from './store';

    $: anyOrgFree = $organizationList.teams?.find(
        (org) => (org as Organization)?.billingPlan === BillingPlan.STARTER
    );

    $: freePlan = $plansInfo.get(BillingPlan.STARTER);
    $: proPlan = $plansInfo.get(BillingPlan.PRO);
</script>

<WizardSecondaryContainer>
    <WizardSecondaryHeader href={`${base}/console`}>Create organization</WizardSecondaryHeader>
    <WizardSecondaryContent>
        <Form onSubmit={() => console.log('test')}>
            <FormList>
                <InputText label="Name" placeholder="Enter name" id="name" />
            </FormList>
            <Label class="u-margin-block-start-16">Select plan</Label>
            <ul
                class="u-flex u-gap-16 u-margin-block-start-8"
                style="--p-grid-item-size:16em; --p-grid-item-size-small-screens:16rem; --grid-gap: 1rem;">
                <li class="u-flex-basis-50-percent">
                    <LabelCard
                        name="plan"
                        bind:group={$createOrganization.billingPlan}
                        value="tier-0"
                        disabled={!!anyOrgFree}
                        tooltipShow={!!anyOrgFree}
                        tooltipText="You are limited to 1 Free organization per account.">
                        <svelte:fragment slot="custom" let:disabled>
                            <div
                                class="u-flex u-flex-vertical u-gap-4 u-width-full-line"
                                class:u-opacity-50={disabled}>
                                <h4 class="body-text-2 u-bold">
                                    {tierFree.name}
                                </h4>
                                <p class="u-color-text-gray u-small">{tierFree.description}</p>
                                <p>
                                    {formatCurrency(freePlan?.price ?? 0)}
                                </p>
                            </div>
                        </svelte:fragment>
                    </LabelCard>
                </li>

                <li class="u-flex-basis-50-percent">
                    <LabelCard
                        name="plan"
                        bind:group={$createOrganization.billingPlan}
                        value="tier-1">
                        <svelte:fragment slot="custom">
                            <div class="u-flex u-flex-vertical u-gap-4 u-width-full-line">
                                <h4 class="body-text-2 u-bold">
                                    {tierPro.name}
                                </h4>
                                <p class="u-color-text-gray u-small">
                                    {tierPro.description}
                                </p>
                                <p>
                                    {formatCurrency(proPlan?.price ?? 0)} per member/month + usage
                                </p>
                            </div>
                        </svelte:fragment>
                    </LabelCard>
                </li>
            </ul>
        </Form>
        <svelte:fragment slot="aside">
            <div class="card">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae, incidunt!
            </div>
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button href={`${base}/console`} secondary>Cancel</Button>
        <Button on:click>Create organization</Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>

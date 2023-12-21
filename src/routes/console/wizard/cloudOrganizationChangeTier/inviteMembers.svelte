<script lang="ts">
    import { Alert } from '$lib/components';
    import { Button, Form, FormList, InputEmail } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { WizardStep } from '$lib/layout';
    import { plansInfo } from '$lib/stores/billing';
    import { onMount } from 'svelte';
    import { changeOrganizationTier } from './store';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { organization } from '$lib/stores/organization';

    const plan = $plansInfo.plans.find((p) => p.$id === $changeOrganizationTier.billingPlan);

    let email: string;

    onMount(async () => {
        const members = await sdk.forConsole.teams.listMemberships($organization.$id);
        if (members.total) {
            $changeOrganizationTier.collaborators = members.memberships
                .map((m) => {
                    if (m.userEmail !== $user.email) return m.userEmail;
                })
                .filter(Boolean);
        }
    });

    function addCollaborator() {
        if (!email) return;
        if ($changeOrganizationTier.collaborators.includes(email)) return;

        $changeOrganizationTier.collaborators.push(email);
        $changeOrganizationTier = $changeOrganizationTier;
        email = '';
    }

    function removeCollaborator(email: string) {
        $changeOrganizationTier.collaborators = $changeOrganizationTier.collaborators.filter(
            (collaborator) => collaborator !== email
        );
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Invite organization members</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Invite team members to collaborate with you in the Appwrite console. Members will have
        access to all services and payment data within your organization.
    </svelte:fragment>

    <Alert type="info">
        {#if $changeOrganizationTier.billingPlan === 'tier-2'}
            You can add unlimited organization members on the {plan.name} plan at no cost. Each member
            added will receive an email invite to your organization on completion.
        {:else if $changeOrganizationTier.billingPlan === 'tier-1'}
            You can add unlimited organization members on the {plan.name} plan for
            <b>${plan.addons.member.price} each per month</b>. Each member added will receive an
            email invite to your organization on completion.
        {/if}
    </Alert>

    <div class="u-margin-block-start-24">
        <Form onSubmit={addCollaborator}>
            <FormList>
                <InputEmail
                    label="Email address"
                    id="email"
                    placeholder="Email address"
                    bind:value={email}>
                    <Button secondary submit>Add</Button>
                </InputEmail>
            </FormList>
        </Form>
    </div>

    {#if $changeOrganizationTier?.collaborators?.length}
        <div class="u-margin-block-start-24">
            <Table noStyles noMargin>
                <TableHeader>
                    <TableCellHead>Collaborator</TableCellHead>
                    {#if $changeOrganizationTier.billingPlan === 'tier-1'}
                        <TableCellHead width={80}>Cost</TableCellHead>
                    {/if}
                    <TableCellHead width={40} />
                </TableHeader>
                <TableBody>
                    {#each $changeOrganizationTier.collaborators as collaborator}
                        <TableRow>
                            <TableCellText title="collaborator">{collaborator}</TableCellText>
                            {#if $changeOrganizationTier.billingPlan === 'tier-1'}
                                <TableCellText title="cost">15$</TableCellText>
                            {/if}
                            <TableCell>
                                <button
                                    type="button"
                                    class="button is-text is-only-icon"
                                    style="--button-size:1.5rem;"
                                    aria-label="remove collaborator"
                                    on:click={() => removeCollaborator(collaborator)}>
                                    <span class="icon-x" aria-hidden="true" />
                                </button>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        </div>
    {/if}
</WizardStep>

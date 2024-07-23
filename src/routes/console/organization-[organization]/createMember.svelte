<script lang="ts">
    import { page } from '$app/stores';
    import { Alert, Modal } from '$lib/components';
    import { InputText, InputEmail, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isCloud } from '$lib/system';
    import { plansInfo } from '$lib/stores/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { projects } from './store';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    const url = `${$page.url.origin}/invite`;
    $: plan = $plansInfo?.get($organization?.billingPlan);

    let email: string,
        name: string,
        error: string,
        role: string = 'owner',
        project: string = 'all';
    let projectsList = [
        {
            label: 'All Projects',
            value: 'all'
        },
        ...$projects.projects.map((project) => ({
            label: project.name,
            value: project.$id
        }))
    ];

    const roles = [
        {
            label: 'Owner',
            value: 'owner'
        },
        {
            label: 'Developer',
            value: 'developer'
        },
        {
            label: 'Editor',
            value: 'editor'
        },
        {
            label: 'Analyst',
            value: 'analyst'
        },
        {
            label: 'Billing',
            value: 'billing'
        }
    ];

    async function create() {
        try {
            const team = await sdk.forConsole.teams.createMembership(
                $organization.$id,
                [roleFormatted],
                email,
                undefined,
                undefined,
                url,
                name || undefined
            );
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.ORGANIZATION);
            await invalidate(Dependencies.MEMBERS);

            showCreate = false;
            addNotification({
                type: 'success',
                message: `Invite has been sent to ${email}`
            });
            trackEvent(Submit.MemberCreate);
            dispatch('created', team);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MemberCreate);
        }
    }

    $: roleFormatted = `projects/${project}/${role}`;

    $: if (!showCreate) {
        error = null;
        email = null;
        name = null;
    }
</script>

<Modal title="Invite member" {error} size="big" bind:show={showCreate} onSubmit={create}>
    {#if isCloud}
        <Alert type="info">
            {#if $organization?.billingPlan === BillingPlan.SCALE}
                You can add unlimited organization members on the {plan.name} plan at no cost.
            {:else if $organization?.billingPlan === BillingPlan.PRO}
                You can add unlimited organization members on the {plan.name} plan for
                <b>{formatCurrency(plan.addons.member.price)} each per billing period</b>.
            {/if}
        </Alert>
    {/if}
    <FormList>
        <InputEmail
            required
            id="email"
            label="Email"
            placeholder="Enter email"
            autofocus={true}
            bind:value={email} />
        <InputText
            id="member-name"
            label="Name (optional)"
            placeholder="Enter name"
            bind:value={name} />
        <InputSelect id="project" label="Projects" options={projectsList} bind:value={project} />
        <InputSelect id="role" label="Role" options={roles} bind:value={role} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Send invite</Button>
    </svelte:fragment>
</Modal>

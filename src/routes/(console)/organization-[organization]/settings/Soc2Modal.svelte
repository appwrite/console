<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { InputEmail, InputSelect, InputText } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { user } from '$lib/stores/user';
    import { VARS } from '$lib/system';
    import { untrack } from 'svelte';
    import type { Models } from '@appwrite.io/console';

    let {
        show = $bindable(false),
        locale,
        countryList
    }: {
        show?: boolean;
        locale: Models.Locale;
        countryList: Models.CountryList;
    } = $props();

    let email = $state($user?.email ?? '');
    let employees = $state<string>(null);
    const employeesOptions = [
        {
            value: '1-5',
            label: '1-5'
        },
        {
            value: '6-10',
            label: '6-10'
        },
        {
            value: '11-50',
            label: '11-50'
        },
        {
            value: '50+',
            label: '50+'
        }
    ];

    let country = $state(untrack(() => locale?.countryCode ?? ''));
    const countryOptions = $derived(
        (countryList?.countries ?? []).map((country) => {
            return {
                value: country.code,
                label: country.name
            };
        })
    );

    let role = $state('');
    let website = $state('');

    let error = $state<string>(null);

    async function handleSubmit() {
        const formData = new FormData();
        formData.append('subject', 'SOC-2 Request');
        formData.append('email', email);
        formData.append('firstName', ($user?.name ?? '').slice(0, 40));
        formData.append(
            'message',
            `SOC-2 request for ${$organization?.name ?? ''} (${$organization?.$id ?? ''})`
        );
        formData.append('tags[]', 'cloud');
        formData.append(
            'metaFields',
            JSON.stringify({
                category: 'SOC-2',
                userName: $user?.name ?? '',
                orgId: $organization?.$id ?? '',
                userId: $user?.$id ?? '',
                billingPlan: $organization?.billingPlanId ?? '',
                employees: employees,
                country: country,
                role: role,
                website: website
            })
        );

        const response = await fetch(`${VARS.GROWTH_ENDPOINT}/support`, {
            method: 'POST',
            body: formData
        });
        trackEvent(Submit.RequestSoc2);
        if (response.status !== 200) {
            trackError(new Error(response.status.toString()), Submit.RequestSoc2);
            error = 'There was an error submitting your request. Please try again later.';
        } else {
            show = false;

            addNotification({
                message: `Your request was sent, we will get in contact with you at ${email} in a few working days`,
                type: 'success'
            });
        }
    }
</script>

<Modal bind:error bind:show onSubmit={handleSubmit} title="Request SOC-2">
    <InputEmail label="Email" placeholder="Enter email" id="email" bind:value={email} />
    <InputSelect
        label="Number of employees"
        id="employees"
        placeholder="Select number of employees"
        required
        options={employeesOptions}
        bind:value={employees} />
    <InputSelect
        label="Country"
        id="country"
        options={countryOptions}
        placeholder="Select country"
        required
        bind:value={country} />
    <InputText
        label="Your role"
        placeholder="Enter your role"
        id="role"
        bind:value={role}
        required />
    <InputText label="Website" placeholder="Enter website" id="website" bind:value={website} />

    <svelte:fragment slot="footer">
        <Button submit>
            <span class="text">Send request</span>
        </Button>
    </svelte:fragment>
</Modal>

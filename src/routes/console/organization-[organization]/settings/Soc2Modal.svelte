<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { FormList, InputEmail, InputSelect, InputText, InputURL } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { VARS } from '$lib/system';
    import { onMount } from 'svelte';
    export let show = false;
    let email = '';
    let employees = null;
    let employeesOptions = [
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

    let country = '';
    let countryOptions = [];

    let role = '';

    onMount(async () => {
        const countryList = await sdk.forProject.locale.listCountries();
        const locale = await sdk.forProject.locale.get();
        if (locale.countryCode) {
            country = locale.countryCode;
        }
        countryOptions = countryList.countries.map((country) => {
            return {
                value: country.code,
                label: country.name
            };
        });
        email = $user.email;
    });

    async function handleSubmit() {
        const response = await fetch(`${VARS.GROWTH_ENDPOINT}/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: 'support',
                email: email,
                firstName: $user?.name ?? '',
                message: 'message',
                tags: ['cloud'],
                customFields: [
                    { id: '41612', value: 'Soc-2' },
                    { id: '48493', value: $user?.name ?? '' },
                    { id: '48492', value: $organization?.$id ?? '' },
                    { id: '48490', value: $user?.$id ?? '' }
                ]
            })
        });
        trackEvent(Submit.RequestSoc2);
        if (response.status !== 200) {
            trackError(new Error(response.status.toString()), Submit.RequestSoc2);
            addNotification({
                message: 'There was an error submitting your request. Please try again later.',
                type: 'error'
            });
        } else {
            addNotification({
                message: `Your request was sent, we will get in contact with you at ${email} in a few working days`,
                type: 'success'
            });
        }
    }
</script>

<Modal
    bind:show
    onSubmit={handleSubmit}
    size="big"
    headerDivider={false}
    title="Service Organization Control Type 2 (Soc-2)">
    <FormList>
        <InputEmail label="Email" placeholder="Enter email" id="email" bind:value={email} />
        <InputSelect
            label="Number of employees"
            id="employees"
            placeholder="Select number of employees"
            required
            options={employeesOptions}
            bind:value={employees} />
        <!-- <InputText label="Company name" placeholder="Enter company name" id="company" /> -->
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
        <InputURL label="Website" placeholder="Enter website" id="website" />
    </FormList>
    <svelte:fragment slot="footer">
        <Button submit>
            <span class="text">Send request</span>
        </Button>
    </svelte:fragment>
</Modal>

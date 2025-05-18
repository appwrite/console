<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { InputEmail, InputSelect, InputText } from '$lib/elements/forms';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { VARS } from '$lib/system';
    import { onMount } from 'svelte';
    export let show = false;
    let email = '';
    let employees: string = null;
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
    let website = '';

    let error: string;

    onMount(async () => {
        /* use console sdk as project is not always available here. */
        const locale = await sdk.forConsole.locale.get();
        const countryList = await sdk.forConsole.locale.listCountries();

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
                subject: 'SOC-2 Request',
                email: email,
                firstName: $user?.name ?? '',
                message: `SOC-2 request for ${$organization?.name ?? ''} (${$organization?.$id ?? ''})`,
                tags: ['cloud'],
                customFields: [
                    { id: '41612', value: 'SOC-2' },
                    { id: '48493', value: $user?.name ?? '' },
                    { id: '48492', value: $organization?.$id ?? '' },
                    { id: '48490', value: $user?.$id ?? '' }
                ],
                metaFields: {
                    employees: employees,
                    country: country,
                    role: role,
                    website: website
                }
            })
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

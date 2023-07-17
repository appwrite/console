<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { organizationList } from '$lib/stores/organization';

    // let credit = 0;
    let coupon: string = null;
    let selectedOrganization: string = null;

    async function redeem() {
        const response = await fetch('/v1/billing/credit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coupon
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            // credit = data.sum;
        }
    }

    $: options = $organizationList.teams?.map((t) => {
        return {
            label: t.name,
            value: t.$id
        };
    });
</script>

<CardGrid>
    <Heading tag="h2" size="6">Available Credit</Heading>

    <p class="text">
        Apply Appwrite credit to your organizations. Once applied, credit will be automatically
        added to your next invoice.
    </p>
    <svelte:fragment slot="aside">
        <FormList>
            <InputText
                placeholder="Coupon code"
                id="coupon"
                label="Add credit"
                bind:value={coupon} />
            <InputSelect
                id="organizations"
                label="Select organizations"
                placeholder="Select organizations"
                bind:value={selectedOrganization}
                {options} />
        </FormList>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={redeem} event="redeem_code">Redeem</Button>
    </svelte:fragment>
</CardGrid>

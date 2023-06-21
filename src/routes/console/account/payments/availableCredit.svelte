<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, FormList, InputText } from '$lib/elements/forms';

    let credit = 0;
    let coupon: string = null;

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
            credit = data.sum;
        }
    }
</script>

<CardGrid>
    <Heading tag="h2" size="6">Available Credit</Heading>

    <p class="text">Appwrite credit will automatically be applied to your next invoice.</p>
    <svelte:fragment slot="aside">
        <p class="text u-bold">Credit balance: <span class="u-success">{credit}</span></p>

        <FormList>
            <InputText
                placeholder="Coupon code"
                id="coupon"
                label="Add credit"
                bind:value={coupon} />
        </FormList>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={redeem} event="redeem_code">Redeem</Button>
    </svelte:fragment>
</CardGrid>

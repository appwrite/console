<script>
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormList, InputNumber, InputSwitch } from '$lib/elements/forms';

    function update() {
        console.log('test');
    }
</script>

<Form onSubmit={update}>
    <CardGrid>
        <Heading tag="h2" size="6">Budget Cap</Heading>
        <p class="text">
            Restrict your resource usage by setting a budget cap. <a
                class="link"
                href="http://#"
                target="_blank"
                rel="noopener noreferrer">Learn more about usage rates</a
            >.
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch label="Budget cap" />
                <InputNumber label="Budget cap ($USD)" placeholder="Enter budget cap" />
            </FormList>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button disabled submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

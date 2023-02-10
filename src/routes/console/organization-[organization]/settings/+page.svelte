<script lang="ts">
    import { CardGrid, Box, AvatarGroup, Heading } from '$lib/components';
    import { InputText, Form, Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { cloudSdk, sdkForConsole } from '$lib/stores/sdk';
    import { members, organization, paymentMethods } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { onMount } from 'svelte';
    import Delete from '../deleteOrganization.svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { loadStripe } from '@stripe/stripe-js';

    let name: string;
    let showDelete = false;
    let stripe: any;
    let elements: any;
    let paymentMethod: any;

    onMount(() => {
        name = $organization.name;
        initStripe();
    });

    async function initStripe() {
        stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.toString());
    }

    async function createPaymentMethod(event) {
        event.preventDefault();

        try {
            paymentMethod = await cloudSdk.billing.createPaymentMethod($organization.$id);
            const options = {
                clientSecret: paymentMethod.clientSecret,
                // Fully customizable with appearance API.
                appearance: {
                    /*...*/
                }
            };
            // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
            elements = stripe.elements(options);

            // Create and mount the Payment Element
            const paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');
        } catch (error) {
            addNotification({
                message: error.toString(),
                type: 'error'
            });
        }
    }

    async function savePaymentDetails(event) {
        event.preventDefault();

        const { error } = await stripe.confirmSetup({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: 'http://localhost:3000'
            }
        });

        if (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        } else {
            if (paymentMethod) {
                const { error, setupIntent } = await stripe.retrieveSetupIntent(
                    paymentMethod.clientSecret
                );

                if (error) {
                    addNotification({
                        message: error.message,
                        type: 'error'
                    });
                } else if (setupIntent && setupIntent.status === 'succeeded') {
                    //update payment method
                    await cloudSdk.billing.updatePaymentMethod(
                        $organization.$id,
                        paymentMethod.$id,
                        setupIntent.payment_method
                    );
                }
            }
        }
    }

    async function updateName() {
        try {
            await sdkForConsole.teams.update($organization.$id, name);
            await invalidate(Dependencies.ORGANIZATION);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent('submit_organization_update_name');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    $: avatars = $members.memberships.map((team) => team.userName);
</script>

<Container>
    {#if $organization}
        <Form on:submit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7">Update Name</Heading>

                <svelte:fragment slot="aside">
                    <ul>
                        <InputText
                            id="name"
                            label="Name"
                            placeholder="Enter name"
                            autocomplete={false}
                            bind:value={name} />
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $organization.name || !name} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <Form on:submit={savePaymentDetails}>
            <CardGrid>
                <Heading tag="h6" size="7">Create Payment Method</Heading>
                {#each $paymentMethods.paymentMethods as paymentMethod}
                    {paymentMethod.providerUserId}
                {/each}

                <div id="payment-element">
                    <!-- Elements will create form elements here -->
                </div>

                <svelte:fragment slot="actions">
                    <Button submit>Save</Button>
                    <Button on:click={createPaymentMethod}>Create Payment Method</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid danger>
            <div>
                <Heading tag="h6" size="7">Delete Organization</Heading>
            </div>
            <p>
                The organization will be permanently deleted, including all projects and data
                associated with this organization. This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="image">
                        <AvatarGroup {avatars} total={$members.total} />
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$organization.name}</h6>
                    </svelte:fragment>
                    <p>{$organization.total} members</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />

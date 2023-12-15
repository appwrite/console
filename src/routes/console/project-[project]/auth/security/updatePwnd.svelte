<script>
    import { CardGrid, Heading } from '$lib/components';
    import { Button, FormList, InputSwitch } from '$lib/elements/forms';
</script>

<CardGrid>
    <Heading tag="h6" size="7">Services</Heading>
    <p class="text">
        Choose services you wish to enable or disable for the client API. When disabled, the
        services are not accessible to client SDKs but remain accessible to server SDKs.
    </p>
    <svelte:fragment slot="aside">
        <div>
            <ul class="buttons-list u-main-end">
                <li class="buttons-list-item">
                    <Button text={true} on:click={() => toggleAllServices(true)}>Enable all</Button>
                </li>
                <li class="buttons-list-item">
                    <Button text={true} on:click={() => toggleAllServices(false)}>
                        Disable all
                    </Button>
                </li>
            </ul>
            <div class="u-sep-block-start u-padding-block-8 u-margin-block-start-8" />
            <form class="form">
                <FormList class="is-multiple">
                    {#each $services.list as service}
                        <InputSwitch
                            label={service.label}
                            id={service.method}
                            bind:value={service.value}
                            on:change={() => {
                                serviceUpdate(service);
                            }} />
                    {/each}
                </FormList>
            </form>
        </div>
    </svelte:fragment>
</CardGrid>

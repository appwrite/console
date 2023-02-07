<script lang="ts">
    import { FormList, InputText, InputDateTime, InputSelect } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { key } from './store';

    function incrementToday(value: number, type: 'day' | 'month' | 'year'): string {
        const date = new Date();
        switch (type) {
            case 'day':
                date.setDate(date.getDate() + value);
                break;
            case 'month':
                date.setMonth(date.getMonth() + value);
                break;
            case 'year':
                date.setMonth(date.getMonth() + value * 12);
                break;
        }

        return date.toISOString();
    }

    let expirationSelect = null;
    let expirationCustom: string | undefined = undefined;

    $: {
        $key.expire = expirationSelect === 'custom' ? expirationCustom : expirationSelect;
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Create an API Key</svelte:fragment>
    <svelte:fragment slot="subtitle">Let's create an API Key.</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label="Name"
            placeholder="API Key Name"
            required
            bind:value={$key.name} />
        <InputSelect
            bind:value={expirationSelect}
            options={[
                {
                    label: 'Never',
                    value: null
                },
                {
                    label: '7 Days',
                    value: incrementToday(7, 'day')
                },
                {
                    label: '30 days',
                    value: incrementToday(30, 'day')
                },
                {
                    label: '90 days',
                    value: incrementToday(90, 'day')
                },
                {
                    label: '1 Year',
                    value: incrementToday(1, 'year')
                },
                {
                    label: 'Custom expiration Date',
                    value: 'custom'
                }
            ]}
            id="preset"
            label="Expiration Date" />
        {#if expirationSelect === 'custom'}
            <InputDateTime id="expire" label="" bind:value={expirationCustom} showLabel={false} />
        {/if}
    </FormList>
</WizardStep>

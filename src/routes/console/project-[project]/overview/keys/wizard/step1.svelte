<script lang="ts">
    import { FormList, InputText, InputDateTime, InputSelect } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { key } from './store';

    let preset = 'never';
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

    $: {
        switch (preset) {
            case 'never':
                $key.expire = null;
                break;
            case '1day':
                $key.expire = incrementToday(1, 'day');
                break;
            case '7days':
                $key.expire = incrementToday(7, 'day');
                break;
            case '1month':
                $key.expire = incrementToday(1, 'month');
                break;
            case '1year':
                $key.expire = incrementToday(1, 'year');
                break;
        }
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
            bind:value={preset}
            options={[
                {
                    label: 'Never',
                    value: 'never'
                },
                {
                    label: '1 Day',
                    value: '1day'
                },
                {
                    label: '7 Days',
                    value: '7days'
                },
                {
                    label: '1 Month',
                    value: '1month'
                },
                {
                    label: '1 Year',
                    value: '1year'
                },
                {
                    label: 'Custom Date',
                    value: 'custom'
                }
            ]}
            id="preset"
            label="Expiration Date" />
        {#if preset === 'custom'}
            <InputDateTime id="expire" label="" bind:value={$key.expire} showLabel={false} />
        {/if}
    </FormList>
</WizardStep>

<script lang="ts">
    import InputDateTime from '$lib/elements/forms/inputDateTime.svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';

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

    export let value: string | null = null;
    let expirationSelect = value === null ? null : 'custom';
    let expirationCustom: string | null = value ?? null;

    $: {
        value = expirationSelect === 'custom' ? expirationCustom : expirationSelect;
    }
</script>

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
            label: 'Custom Date',
            value: 'custom'
        }
    ]}
    id="preset"
    label="Expiration Date" />
{#if expirationSelect === 'custom'}
    <InputDateTime id="expire" label="" bind:value={expirationCustom} showLabel={false} />
{/if}

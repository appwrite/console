<script lang="ts">
    import { Helper, InputDateTime, InputSelect } from '$lib/elements/forms';
    import { isSameDay, isValidDate, toLocaleDate } from '$lib/helpers/date';

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

    const options = [
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
    ];

    export let value: string | null = null;

    function initExpirationSelect() {
        if (value === null || !isValidDate(value)) return null;

        let result = 'custom';
        for (const option of options) {
            if (!isValidDate(option.value)) continue;

            if (isSameDay(new Date(option.value), new Date(value))) {
                result = option.value;
                break;
            }
        }

        return result;
    }
    let expirationSelect = initExpirationSelect();
    let expirationCustom: string | null = value ?? null;

    $: {
        if (!isSameDay(new Date(expirationSelect), new Date(value))) {
            value = expirationSelect === 'custom' ? expirationCustom : expirationSelect;
        }
    }
</script>

<InputSelect bind:value={expirationSelect} {options} id="preset" label="Expiration Date">
    <svelte:fragment slot="helper">
        {#if expirationSelect !== 'custom' && expirationSelect !== null}
            <Helper type="neutral">Your key will expire in {toLocaleDate(value)}</Helper>
        {/if}
    </svelte:fragment>
</InputSelect>
{#if expirationSelect === 'custom'}
    <InputDateTime required id="expire" label="" bind:value={expirationCustom} showLabel={false} />
{/if}

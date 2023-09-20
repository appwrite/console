<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { copy } from '$lib/helpers/copy';
    import { addNotification } from '$lib/stores/notifications';
    export let value: string;
    export let label: string = null;
    export let showLabel = false;

    let content = 'Copy';
    
    const handleCopy = async () => {
        const success = await copy(value);

        if (success) {
            content = 'Copied';
        } else {
            addNotification({
                message: 'Unable to copy to clipboard',
                type: 'error'
            });
        }
    };
</script>
<style>
    span.icon-duplicate {
        cursor: pointer;
    }
</style>
<div>
    <label class:u-hide={!showLabel} class="label" for={label}>{label}</label>
    <div class="input-text-wrapper" style="--amount-of-buttons:1">
        <input {value} id={label} type="text" class="input-text" readonly />
        <div class="options-list">
           
            <span 
                class="icon-duplicate" aria-label="Copy"
                on:click={handleCopy}
                on:mouseenter={() => setTimeout(() => (content = 'Copy'))}
                use:tooltip={{
                    content,
                    hideOnClick: false,
                    appendTo: 'parent',
                }}
             />
           
        </div>
    </div>
</div>

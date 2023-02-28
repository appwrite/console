<script lang="ts">
    import { Button } from '$lib/elements/forms';

    export let headers: [string, string][];
</script>

<label class="label">Headers</label>

<ul class="form-list">
    {#if headers}
        {#each headers as [key, value], index}
            <li class="form-item is-multiple">
                <div class="form-item-part u-stretch">
                    <label class="label" for={`key-${index}`}>Key</label>
                    <div class="input-text-wrapper">
                        <input
                            id={`key-${key}`}
                            placeholder="Enter key"
                            type="text"
                            class="input-text"
                            bind:value={key} />
                    </div>
                </div>
                <div class="form-item-part u-stretch">
                    <label class="label" for={`value-${index}`}> Value </label>
                    <div class="input-text-wrapper">
                        <input
                            id={`value-${value}`}
                            placeholder="Enter value"
                            type="text"
                            class="input-text"
                            bind:value />
                    </div>
                </div>
                <div class="form-item-part u-cross-child-end">
                    <Button
                        text
                        disabled={(!key || !value) && index === 0}
                        on:click={() => {
                            if (index === 0) {
                                headers = [['', '']];
                            } else {
                                headers.splice(index, 1);
                                headers = headers;
                            }
                        }}>
                        <span class="icon-x" aria-hidden="true" />
                    </Button>
                </div>
            </li>
        {/each}
    {/if}
</ul>
<Button
    noMargin
    text
    disabled={headers?.length && headers[headers.length - 1][0] && headers[headers.length - 1][1]
        ? false
        : true}
    on:click={() => {
        if (headers[headers.length - 1][0] && headers[headers.length - 1][1]) {
            headers.push(['', '']);
            headers = headers;
        }
    }}>
    <span class="icon-plus" aria-hidden="true" />
    <span class="text">Add Header</span>
</Button>

<script lang="ts">
    import { Button, Form, FormList, InputTextarea } from '$lib/elements/forms';
    export let onSubmit: (data: any) => Promise<void> | void;

    export let message: string;

    function submit() {
        if (onSubmit) {
            onSubmit({ message });
        }
    }

    function reset() {
        console.log('reset form');
    }
</script>

<Form onSubmit={submit}>
    <FormList>
        <InputTextarea bind:value={message} id="message" label="Message" />
    </FormList>
    <div class="u-flex">
        <Button on:click={reset} text>Reset changes</Button>
        <Button submit>Update</Button>
    </div>
</Form>

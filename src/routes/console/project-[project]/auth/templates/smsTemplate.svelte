<script lang="ts">
    import { Box } from '$lib/components';
    import { Form, FormList, InputEmail, InputText, InputTextarea } from '$lib/elements/forms';
    export let onSubmit: () => Promise<void> | void;
</script>

<Box>
    <Form {onSubmit}>
        <FormList>
            <InputTextarea id="message" label="Message" />
        </FormList>
    </Form>
</Box>

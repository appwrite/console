<script lang="ts">
    import { Form } from '$lib/elements/forms';

    export let submit: (e: Event) => void | Promise<void>;
</script>

<div class="wizard-main">
    <Form noStyle onSubmit={submit}>
        <slot />
    </Form>
</div>

<script lang="ts">
    import Form from '../elements/forms/form.svelte';
    import Button from '../elements/forms/button.svelte';

    export let onSubmit: () => Promise<void> | void;
</script>

<Form {onSubmit}>
    <Button submit>Submit</Button>
    <Button>Button</Button>
</Form>

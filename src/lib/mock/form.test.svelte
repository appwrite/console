<script lang="ts">
    import Form from '../elements/forms/form.svelte';
    import Button from '../elements/forms/button.svelte';
    import LL from '$i18n/i18n-svelte';

    export let onSubmit: () => Promise<void> | void;
</script>

<Form {onSubmit}>
    <Button submit>{$LL.console.project.button.submit.submit()}</Button>
    <Button>{$LL.console.project.button.button()}</Button>
</Form>

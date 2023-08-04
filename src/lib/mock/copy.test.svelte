<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { Copy } from '../components';

    export let value: string;
</script>

<Copy {value}>
    <span data-testid="copy-content">{$LL.console.project.mock.content()}</span>
</Copy>

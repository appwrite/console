<script lang="ts">
    import { app } from '$lib/stores/app';
    import Light from '../assets/vscode.svg';
    import Dark from '../assets/dark/vscode.svg';
</script>

<img src={$app.themeInUse === 'dark' ? Dark : Light} width="16" height="16" alt="" />

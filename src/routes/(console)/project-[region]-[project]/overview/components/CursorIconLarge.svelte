<script lang="ts">
    import { app } from '$lib/stores/app';
    import Light from '../assets/cursor-ai.svg';
    import Dark from '../assets/dark/cursor-ai.svg';
</script>

<img src={$app.themeInUse === 'dark' ? Dark : Light} width="20" height="20" alt="" />

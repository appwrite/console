<script lang="ts">
    import { NoToneMapping } from 'three';
    import { Canvas } from '@threlte/core';
    import ProductHuntSvg from './product-hunt.svg';
    import ImaginationShader from './shader.svelte';
</script>

<div class="imagine-animation">
    <div class="imagine-canvas">
        <Canvas toneMapping={NoToneMapping} dpr={1}>
            <ImaginationShader />
        </Canvas>
    </div>

    <!--- Hidden logo
    <img src={ImagineSvg} alt="Imagine" class="imagine-logo" />
    -->

    <img src={ProductHuntSvg} alt="Product Hunt" class="imagine-logo" />
</div>

<style>
    .imagine-animation {
        height: 132px;
        border-radius: 8px;
        position: relative;
        background-color: #000000;
        border: 0.795px solid var(--border-neutral-strong);
        overflow: hidden;
    }

    .imagine-canvas {
        position: absolute;
        inset: 0;
    }

    .imagine-logo {
        top: 50%;
        left: 50%;
        width: auto;
        height: 40px;
        position: absolute;
        transform: translate(-50%, -50%);
    }
</style>

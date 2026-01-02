<script lang="ts">
    import { T, useTask, useThrelte } from '@threlte/core';
    import { Uniform, MeshBasicMaterial, Vector2 } from 'three';
    import noise from './threlte/shaders/noise.glsl?raw';
    import { onMount } from 'svelte';
    import { useViewport } from '@threlte/extras';

    const { invalidate } = useThrelte();
    const viewport = useViewport();

    let uAspect: Uniform;
    let uOpacity: Uniform;
    let uTime: Uniform;
    let uViewportSize: Uniform;

    $effect(() => {
        const width = $viewport.width;
        const height = $viewport.height;
        if (uAspect) {
            uAspect.value = width / height;
            invalidate();
        }
        if (uViewportSize) {
            uViewportSize.value.x = width;
            uViewportSize.value.y = height;
            invalidate();
        }
    });

    let material = $state<MeshBasicMaterial>(new MeshBasicMaterial());

    onMount(() => {
        uAspect = new Uniform($viewport.width / $viewport.height);
        uOpacity = new Uniform(0);
        uTime = new Uniform(0);
        uViewportSize = new Uniform(new Vector2($viewport.width, $viewport.height));

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = uTime;
            shader.uniforms.uAspect = uAspect;
            shader.uniforms.uOpacity = uOpacity;
            shader.uniforms.uViewportSize = uViewportSize;
            shader.fragmentShader = `
			uniform float uTime;
			uniform float uAspect;
			uniform float uOpacity;
			uniform vec2 uViewportSize;
			${noise}

			float getValue(vec2 uv, vec2 screenPos){
      			vec2 cID = floor(uv);
      			vec2 cUV = fract(uv);

      			vec3 gradient, dg, dg2;
      			float n = psrddnoise(vec3(cID * 0.03, uTime * 0.08), vec3(0.0), uTime * 0.25, gradient, dg, dg2);
      			n = abs(n);

				// Radial gradient masking - reduce noise in center
				vec2 centerDist = (screenPos - 0.5) * vec2(1.0, 1.0 / 0.7);
				float distFromCenter = length(centerDist) * 2.0;
				float centerMask = 1.0 - smoothstep(0.65, 1.3, distFromCenter);
				n = n * (1.0 - centerMask * 0.95);

      			float r = sqrt(2.) * (1. - n * 0.4);
      			float fw = length(fwidth(uv));
      			float fCircle = smoothstep(r, r + fw, length(cUV - 0.5) * 2.);
      			return fCircle;
      		}
			${shader.fragmentShader}`.replace(
                `vec4 diffuseColor = vec4( diffuse, opacity );`,
                `
  				vec3 col = diffuse;

				// Optimized for small size - larger dots
				float scaleFactor = 45.0;

  				vec2 uv = (vUv - 0.5) * vec2(scaleFactor, scaleFactor / uAspect);
  				vec2 shift = vec2(-0.12, 1.25);

  	    		col.r = getValue(uv + shift, vUv);
        		col.g = getValue(uv, vUv);
        		col.b = getValue(uv - shift, vUv);

				float overlap = min(min(col.r, col.g), col.b);
				col = mix(col, vec3(1.0), overlap * 0.5);

  				float alpha = max(max(col.r, col.g), col.b) * uOpacity;
  				vec4 diffuseColor = vec4(col, alpha);
  			`
            );
        };

        material.defines = { USE_UV: '' };
        material.transparent = true;

        uOpacity.value = 1;
        uTime.value = 0;
        invalidate();
    });

    useTask((delta) => {
        uTime.value += delta;
    });
</script>

<T.OrthographicCamera position={[0, 0, 10]} fov={10} near={0.1} far={1000} makeDefault />
<T.Mesh scale={[$viewport.width, $viewport.height, 1]} {material}>
    <T.PlaneGeometry args={[1, 1]} />
</T.Mesh>

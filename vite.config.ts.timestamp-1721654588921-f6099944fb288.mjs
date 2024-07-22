// vite.config.ts
import { defineConfig } from "file:///home/odin/Work/console/node_modules/vitest/dist/config.js";
import { sveltekit } from "file:///home/odin/Work/console/node_modules/@sveltejs/kit/src/exports/vite/index.js";
var config = defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ["echarts", "prismjs"]
  },
  ssr: {
    noExternal: [
      "@analytics/google-analytics",
      "@sentry/browser",
      "@sentry-internal/tracing",
      "analytics",
      "dayjs",
      "dotenv",
      "echarts",
      "prismjs",
      "zrender"
    ]
  },
  server: {
    port: 3e3
  }
});
var testConfig = defineConfig({
  resolve: {
    // hotfix for https://github.com/vitest-dev/vitest/issues/2834
    conditions: ["browser"]
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "jsdom",
    globals: true,
    pool: "threads",
    setupFiles: ["./tests/unit/setup.ts"],
    server: {
      deps: {
        inline: ["@analytics/type-utils"]
      }
    }
  }
});
var vite_config_default = process.env.VITEST ? {
  ...config,
  ...testConfig
} : config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9vZGluL1dvcmsvY29uc29sZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvb2Rpbi9Xb3JrL2NvbnNvbGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvb2Rpbi9Xb3JrL2NvbnNvbGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlc3QvY29uZmlnJztcbmltcG9ydCB7IHN2ZWx0ZWtpdCB9IGZyb20gJ0BzdmVsdGVqcy9raXQvdml0ZSc7XG5cbmNvbnN0IGNvbmZpZyA9IGRlZmluZUNvbmZpZyh7XG4gICAgcGx1Z2luczogW3N2ZWx0ZWtpdCgpXSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgICAgaW5jbHVkZTogWydlY2hhcnRzJywgJ3ByaXNtanMnXVxuICAgIH0sXG4gICAgc3NyOiB7XG4gICAgICAgIG5vRXh0ZXJuYWw6IFtcbiAgICAgICAgICAgICdAYW5hbHl0aWNzL2dvb2dsZS1hbmFseXRpY3MnLFxuICAgICAgICAgICAgJ0BzZW50cnkvYnJvd3NlcicsXG4gICAgICAgICAgICAnQHNlbnRyeS1pbnRlcm5hbC90cmFjaW5nJyxcbiAgICAgICAgICAgICdhbmFseXRpY3MnLFxuICAgICAgICAgICAgJ2RheWpzJyxcbiAgICAgICAgICAgICdkb3RlbnYnLFxuICAgICAgICAgICAgJ2VjaGFydHMnLFxuICAgICAgICAgICAgJ3ByaXNtanMnLFxuICAgICAgICAgICAgJ3pyZW5kZXInXG4gICAgICAgIF1cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiAzMDAwXG4gICAgfVxufSk7XG5cbmNvbnN0IHRlc3RDb25maWcgPSBkZWZpbmVDb25maWcoe1xuICAgIHJlc29sdmU6IHtcbiAgICAgICAgLy8gaG90Zml4IGZvciBodHRwczovL2dpdGh1Yi5jb20vdml0ZXN0LWRldi92aXRlc3QvaXNzdWVzLzI4MzRcbiAgICAgICAgY29uZGl0aW9uczogWydicm93c2VyJ11cbiAgICB9LFxuICAgIHRlc3Q6IHtcbiAgICAgICAgaW5jbHVkZTogWyd0ZXN0cy91bml0LyoqLyoudGVzdC50cyddLFxuICAgICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICAgICAgZ2xvYmFsczogdHJ1ZSxcbiAgICAgICAgcG9vbDogJ3RocmVhZHMnLFxuICAgICAgICBzZXR1cEZpbGVzOiBbJy4vdGVzdHMvdW5pdC9zZXR1cC50cyddLFxuICAgICAgICBzZXJ2ZXI6IHtcbiAgICAgICAgICAgIGRlcHM6IHtcbiAgICAgICAgICAgICAgICBpbmxpbmU6IFsnQGFuYWx5dGljcy90eXBlLXV0aWxzJ11cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBwcm9jZXNzLmVudi5WSVRFU1RcbiAgICA/IHtcbiAgICAgICAgICAuLi5jb25maWcsXG4gICAgICAgICAgLi4udGVzdENvbmZpZ1xuICAgICAgfVxuICAgIDogY29uZmlnO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UCxTQUFTLG9CQUFvQjtBQUNwUixTQUFTLGlCQUFpQjtBQUUxQixJQUFNLFNBQVMsYUFBYTtBQUFBLEVBQ3hCLFNBQVMsQ0FBQyxVQUFVLENBQUM7QUFBQSxFQUNyQixjQUFjO0FBQUEsSUFDVixTQUFTLENBQUMsV0FBVyxTQUFTO0FBQUEsRUFDbEM7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNELFlBQVk7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLEVBQ1Y7QUFDSixDQUFDO0FBRUQsSUFBTSxhQUFhLGFBQWE7QUFBQSxFQUM1QixTQUFTO0FBQUE7QUFBQSxJQUVMLFlBQVksQ0FBQyxTQUFTO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNGLFNBQVMsQ0FBQyx5QkFBeUI7QUFBQSxJQUNuQyxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixZQUFZLENBQUMsdUJBQXVCO0FBQUEsSUFDcEMsUUFBUTtBQUFBLE1BQ0osTUFBTTtBQUFBLFFBQ0YsUUFBUSxDQUFDLHVCQUF1QjtBQUFBLE1BQ3BDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFDSixDQUFDO0FBRUQsSUFBTyxzQkFBUSxRQUFRLElBQUksU0FDckI7QUFBQSxFQUNJLEdBQUc7QUFBQSxFQUNILEdBQUc7QUFDUCxJQUNBOyIsCiAgIm5hbWVzIjogW10KfQo=

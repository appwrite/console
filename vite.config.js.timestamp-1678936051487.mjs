// vite.config.js
import { sveltekit } from 'file:///Users/ionicisere/Documents/github/console/node_modules/@sveltejs/kit/src/exports/vite/index.js';
var config = {
    plugins: [sveltekit()],
    optimizeDeps: {
        include: ['echarts', 'prismjs']
    },
    ssr: {
        noExternal: ['echarts', 'prismjs', '@analytics/google-analytics', 'analytics']
    },
    define: {
        'import.meta.env.VERCEL_ANALYTICS_ID': JSON.stringify(process.env.VERCEL_ANALYTICS_ID)
    },
    legacy: {
        buildSsrCjsExternalHeuristics: true
    },
    server: {
        port: 3e3
    }
};
var testConfig = {
    resolve: {
        // hotfix for https://github.com/vitest-dev/vitest/issues/2834
        conditions: ['browser']
    },
    test: {
        include: ['tests/**/*.test.ts'],
        environment: 'jsdom',
        globals: true,
        threads: true,
        setupFiles: ['./tests/unit/setup.ts'],
        deps: {
            inline: ['@analytics/type-utils']
        }
    }
};
var vite_config_default = process.env.VITEST
    ? {
          ...config,
          ...testConfig
      }
    : config;
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaW9uaWNpc2VyZS9Eb2N1bWVudHMvZ2l0aHViL2NvbnNvbGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9pb25pY2lzZXJlL0RvY3VtZW50cy9naXRodWIvY29uc29sZS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvaW9uaWNpc2VyZS9Eb2N1bWVudHMvZ2l0aHViL2NvbnNvbGUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuXG4vKiogQHR5cGUge2ltcG9ydCgndml0ZScpLlVzZXJDb25maWd9ICovXG5jb25zdCBjb25maWcgPSB7XG4gICAgcGx1Z2luczogW3N2ZWx0ZWtpdCgpXSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgICAgaW5jbHVkZTogWydlY2hhcnRzJywgJ3ByaXNtanMnXVxuICAgIH0sXG4gICAgc3NyOiB7XG4gICAgICAgIG5vRXh0ZXJuYWw6IFsnZWNoYXJ0cycsICdwcmlzbWpzJywgJ0BhbmFseXRpY3MvZ29vZ2xlLWFuYWx5dGljcycsICdhbmFseXRpY3MnXVxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAgICdpbXBvcnQubWV0YS5lbnYuVkVSQ0VMX0FOQUxZVElDU19JRCc6IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52LlZFUkNFTF9BTkFMWVRJQ1NfSUQpXG4gICAgfSxcbiAgICBsZWdhY3k6IHtcbiAgICAgICAgYnVpbGRTc3JDanNFeHRlcm5hbEhldXJpc3RpY3M6IHRydWVcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiAzMDAwXG4gICAgfVxufTtcblxuLyoqIEB0eXBlIHtpbXBvcnQoJ3ZpdGUnKS5Vc2VyQ29uZmlnfSAqL1xuY29uc3QgdGVzdENvbmZpZyA9IHtcbiAgICByZXNvbHZlOiB7XG4gICAgICAgIC8vIGhvdGZpeCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3ZpdGVzdC1kZXYvdml0ZXN0L2lzc3Vlcy8yODM0XG4gICAgICAgIGNvbmRpdGlvbnM6IFsnYnJvd3NlciddXG4gICAgfSxcbiAgICB0ZXN0OiB7XG4gICAgICAgIGluY2x1ZGU6IFsndGVzdHMvKiovKi50ZXN0LnRzJ10sXG4gICAgICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgICAgICBnbG9iYWxzOiB0cnVlLFxuICAgICAgICB0aHJlYWRzOiB0cnVlLFxuICAgICAgICBzZXR1cEZpbGVzOiBbJy4vdGVzdHMvdW5pdC9zZXR1cC50cyddLFxuICAgICAgICBkZXBzOiB7XG4gICAgICAgICAgICBpbmxpbmU6IFsnQGFuYWx5dGljcy90eXBlLXV0aWxzJ11cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHByb2Nlc3MuZW52LlZJVEVTVFxuICAgID8ge1xuICAgICAgICAgIC4uLmNvbmZpZyxcbiAgICAgICAgICAuLi50ZXN0Q29uZmlnXG4gICAgICB9XG4gICAgOiBjb25maWc7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdULFNBQVMsaUJBQWlCO0FBRzFVLElBQU0sU0FBUztBQUFBLEVBQ1gsU0FBUyxDQUFDLFVBQVUsQ0FBQztBQUFBLEVBQ3JCLGNBQWM7QUFBQSxJQUNWLFNBQVMsQ0FBQyxXQUFXLFNBQVM7QUFBQSxFQUNsQztBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0QsWUFBWSxDQUFDLFdBQVcsV0FBVywrQkFBK0IsV0FBVztBQUFBLEVBQ2pGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSix1Q0FBdUMsS0FBSyxVQUFVLFFBQVEsSUFBSSxtQkFBbUI7QUFBQSxFQUN6RjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osK0JBQStCO0FBQUEsRUFDbkM7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxFQUNWO0FBQ0o7QUFHQSxJQUFNLGFBQWE7QUFBQSxFQUNmLFNBQVM7QUFBQTtBQUFBLElBRUwsWUFBWSxDQUFDLFNBQVM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsU0FBUyxDQUFDLG9CQUFvQjtBQUFBLElBQzlCLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFlBQVksQ0FBQyx1QkFBdUI7QUFBQSxJQUNwQyxNQUFNO0FBQUEsTUFDRixRQUFRLENBQUMsdUJBQXVCO0FBQUEsSUFDcEM7QUFBQSxFQUNKO0FBQ0o7QUFFQSxJQUFPLHNCQUFRLFFBQVEsSUFBSSxTQUNyQjtBQUFBLEVBQ0ksR0FBRztBQUFBLEVBQ0gsR0FBRztBQUNQLElBQ0E7IiwKICAibmFtZXMiOiBbXQp9Cg==

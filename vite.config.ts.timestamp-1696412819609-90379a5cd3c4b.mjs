// vite.config.ts
import { defineConfig } from "file:///home/thomas/Programming/Work/Appwrite/console/node_modules/vitest/dist/config.js";
import { sveltekit } from "file:///home/thomas/Programming/Work/Appwrite/console/node_modules/@sveltejs/kit/src/exports/vite/index.js";
var config = defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ["echarts", "prismjs"]
  },
  ssr: {
    noExternal: [
      "echarts",
      "prismjs",
      "@analytics/google-analytics",
      "analytics",
      "dayjs",
      "dotenv"
    ]
  },
  define: {
    "import.meta.env.VERCEL_ANALYTICS_ID": JSON.stringify(process.env.VERCEL_ANALYTICS_ID)
  },
  legacy: {
    buildSsrCjsExternalHeuristics: true
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
    threads: true,
    setupFiles: ["./tests/unit/setup.ts"],
    deps: {
      inline: ["@analytics/type-utils"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS90aG9tYXMvUHJvZ3JhbW1pbmcvV29yay9BcHB3cml0ZS9jb25zb2xlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS90aG9tYXMvUHJvZ3JhbW1pbmcvV29yay9BcHB3cml0ZS9jb25zb2xlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Rob21hcy9Qcm9ncmFtbWluZy9Xb3JrL0FwcHdyaXRlL2NvbnNvbGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlc3QvY29uZmlnJztcbmltcG9ydCB7IHN2ZWx0ZWtpdCB9IGZyb20gJ0BzdmVsdGVqcy9raXQvdml0ZSc7XG5cbmNvbnN0IGNvbmZpZyA9IGRlZmluZUNvbmZpZyh7XG4gICAgcGx1Z2luczogW3N2ZWx0ZWtpdCgpXSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgICAgaW5jbHVkZTogWydlY2hhcnRzJywgJ3ByaXNtanMnXVxuICAgIH0sXG4gICAgc3NyOiB7XG4gICAgICAgIG5vRXh0ZXJuYWw6IFtcbiAgICAgICAgICAgICdlY2hhcnRzJyxcbiAgICAgICAgICAgICdwcmlzbWpzJyxcbiAgICAgICAgICAgICdAYW5hbHl0aWNzL2dvb2dsZS1hbmFseXRpY3MnLFxuICAgICAgICAgICAgJ2FuYWx5dGljcycsXG4gICAgICAgICAgICAnZGF5anMnLFxuICAgICAgICAgICAgJ2RvdGVudidcbiAgICAgICAgXVxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAgICdpbXBvcnQubWV0YS5lbnYuVkVSQ0VMX0FOQUxZVElDU19JRCc6IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52LlZFUkNFTF9BTkFMWVRJQ1NfSUQpXG4gICAgfSxcbiAgICBsZWdhY3k6IHtcbiAgICAgICAgYnVpbGRTc3JDanNFeHRlcm5hbEhldXJpc3RpY3M6IHRydWVcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiAzMDAwXG4gICAgfVxufSk7XG5cbmNvbnN0IHRlc3RDb25maWcgPSBkZWZpbmVDb25maWcoe1xuICAgIHJlc29sdmU6IHtcbiAgICAgICAgLy8gaG90Zml4IGZvciBodHRwczovL2dpdGh1Yi5jb20vdml0ZXN0LWRldi92aXRlc3QvaXNzdWVzLzI4MzRcbiAgICAgICAgY29uZGl0aW9uczogWydicm93c2VyJ11cbiAgICB9LFxuICAgIHRlc3Q6IHtcbiAgICAgICAgaW5jbHVkZTogWyd0ZXN0cy91bml0LyoqLyoudGVzdC50cyddLFxuICAgICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICAgICAgZ2xvYmFsczogdHJ1ZSxcbiAgICAgICAgdGhyZWFkczogdHJ1ZSxcbiAgICAgICAgc2V0dXBGaWxlczogWycuL3Rlc3RzL3VuaXQvc2V0dXAudHMnXSxcbiAgICAgICAgZGVwczoge1xuICAgICAgICAgICAgaW5saW5lOiBbJ0BhbmFseXRpY3MvdHlwZS11dGlscyddXG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgcHJvY2Vzcy5lbnYuVklURVNUXG4gICAgPyB7XG4gICAgICAgICAgLi4uY29uZmlnLFxuICAgICAgICAgIC4uLnRlc3RDb25maWdcbiAgICAgIH1cbiAgICA6IGNvbmZpZztcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFQsU0FBUyxvQkFBb0I7QUFDelYsU0FBUyxpQkFBaUI7QUFFMUIsSUFBTSxTQUFTLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsRUFDckIsY0FBYztBQUFBLElBQ1YsU0FBUyxDQUFDLFdBQVcsU0FBUztBQUFBLEVBQ2xDO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDRCxZQUFZO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLHVDQUF1QyxLQUFLLFVBQVUsUUFBUSxJQUFJLG1CQUFtQjtBQUFBLEVBQ3pGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDSiwrQkFBK0I7QUFBQSxFQUNuQztBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLEVBQ1Y7QUFDSixDQUFDO0FBRUQsSUFBTSxhQUFhLGFBQWE7QUFBQSxFQUM1QixTQUFTO0FBQUE7QUFBQSxJQUVMLFlBQVksQ0FBQyxTQUFTO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNGLFNBQVMsQ0FBQyx5QkFBeUI7QUFBQSxJQUNuQyxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxZQUFZLENBQUMsdUJBQXVCO0FBQUEsSUFDcEMsTUFBTTtBQUFBLE1BQ0YsUUFBUSxDQUFDLHVCQUF1QjtBQUFBLElBQ3BDO0FBQUEsRUFDSjtBQUNKLENBQUM7QUFFRCxJQUFPLHNCQUFRLFFBQVEsSUFBSSxTQUNyQjtBQUFBLEVBQ0ksR0FBRztBQUFBLEVBQ0gsR0FBRztBQUNQLElBQ0E7IiwKICAibmFtZXMiOiBbXQp9Cg==

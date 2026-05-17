import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: "assets/main.js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
});

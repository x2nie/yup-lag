"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vite_1 = require("vite");
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)({
    resolve: {
        alias: {
            //   '@': path.resolve(__dirname, './src'),
            '@lib': path.resolve(__dirname, './src/lib'),
            //   '@components': path.resolve(__dirname, './src/components'),
        },
    },
    plugins: []
});
//# sourceMappingURL=vite.config.js.map
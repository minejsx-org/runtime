import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'jsx-runtime': 'src/jsx-runtime.ts',
        'jsx-dev-runtime': 'src/jsx-dev-runtime.ts'
    },
    format              : ['cjs', 'esm'],
    dts                 : true,
    splitting           : false,
    sourcemap           : true,
    clean               : true,
    minify              : true,
    treeshake           : true,
    external            : ['bun'],
    target              : 'es2022',
    outDir              : 'dist',
});
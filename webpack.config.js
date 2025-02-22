const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development', // or 'production' if you're ready for that
    entry: {
        background: path.resolve(__dirname, 'src/background.ts'),
        contentScript: path.resolve(__dirname, 'src/contentScript.ts'),
        popup: path.resolve(__dirname, 'src/popup.ts')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    devtool: 'source-map', // Use source-map instead of eval-source-map
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'manifest.json', to: '' },
                // Copy other static assets if needed
                { from: 'src/popup.html', to: '' },
                // { from: 'public', to: '' }
            ]
        })
    ]
};

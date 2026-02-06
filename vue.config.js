module.exports = {
    devServer: {
        proxy: {
            '/app-api': {
                target: 'http://hnapi.booseng.com/app-api',
                changeOrigin: true,
            },
        },
    },
    // css: {
    //     loaderOptions: {
    //         scss: {
    //             additionalData: '@import "@style/main.scss";'
    //         }
    //     }
    // }
}

import uni from "@dcloudio/vite-plugin-uni";
import { VUE_APP_API_URL } from "./config";

// https://vitejs.dev/config/
export default ({mode}) => {
    return {
        plugins: [uni()],

        server: {
            https: false,
            port: 10086,
            proxy: {
                ["/HealthCoast-api"]: {
                    target: VUE_APP_API_URL,
                    ws: false,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/HealthCoast-api/, ''),
                },
            }
        },
        // css: {
        //     /* CSS 预处理器 */
        //     preprocessorOptions: {
        //         scss: {
        //             additionalData: '@import "@/style/main.scss";'
        //         }
        //     }
        // },
        // 打包相关
        build: {
            cssCodeSplit: true,// 启用/禁用 CSS 代码拆分
            assetsInlineLimit: 4096, // 图片转base64编码的阈值
            terserOptions: {
                compress: {
                    drop_console: false,
                    drop_debugger: true
                }
            }
        }
    }
}

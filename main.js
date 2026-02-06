/*
 * @Author: Gaoxs
 * @Date: 2023-04-07 15:12:06
 * @LastEditors: Gaoxs
 * @Description:
 */
import App from './App'
import uvUI from '@/uni_modules/uv-ui-tools'
import { createSSRApp } from 'vue'
import store from "@/store";
import util from '@/utils'
// #ifdef H5
// import VConsole from 'vconsole'

// #endif

export function createApp() {
    const app = createSSRApp(App)
    app.use(util)
    app.use(store)
    app.use(uvUI);
    uni.$uv.setConfig({
        config: {
            // 修改默认单位为rpx，相当于执行 uni.$uv.config.unit = 'rpx'
        },
        props: {
            datetimePicker: {
                color: {
                    default: 'red'
                },
                confirmColor: {
                    default: '#00CBCC'
                }
            },
            picker: {
                confirmColor: {
                    default: '#00CBCC'
                }
            }
        }
    })
    
    // 全局错误处理
    function errorHandler(err, instance, info) {
      console.error('Global error handler:', err, instance, info);
      
      // 记录错误信息到日志
      // try {
      //   uni.request({
      //     url: '/api/error-log', // 错误日志上报接口
      //     method: 'POST',
      //     data: {
      //       message: err.message,
      //       stack: err.stack,
      //       info: info,
      //       userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      //       timestamp: Date.now()
      //     }
      //   });
      // } catch (logError) {
      //   console.error('Failed to log error:', logError);
      // }
      
      // 显示友好提示（可选）
      // util.toast('系统出现异常，请稍后重试');
    }

    // 注册全局错误处理
    app.config.errorHandler = errorHandler;

    // #ifdef H5
    // const vConsole = new VConsole()
    // app.use(vConsole)
    // #endif
    return {
        app,
    }
}

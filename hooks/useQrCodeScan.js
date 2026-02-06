/**
 * @name: useQrCodeScan
 * @author: kahu4
 * @date: 2024-01-22 14:01
 * @description：useQrCodeScan
 * @update: 2024-01-22 14:01
 * */
// #ifdef H5
import { Html5Qrcode } from "html5-qrcode"
// #endif
export const useQrCodeScan = () => {
    let html5QrCode

    const qrCodeScan = (options = {}) => {
        let res
        // #ifdef H5
        res = _qrInH5(options)
        // #endif
        // #ifndef H5
        res = _qrInNonH5(options)
        // #endif
        return res
    }

    /**
     * 非h5环境扫码
     * @param options
     * @return {Promise<unknown>}
     * @private
     */
    const _qrInNonH5 = (options = {}) => {
        // #ifndef H5
        return new Promise((resolve, reject) => {
            const defaultOptions = {
                onlyFromCamera: false,
                scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
                hideAlbum: false
            }
            uni.scanCode({
                ...defaultOptions,
                ...options,
                success: (res) => {
                    resolve(res.result)
                },
                fail: (err) => {
                    reject(err)
                }
            })
        })
        // #endif
    }

    /**
     * H5环境扫码
     * @param options
     * @return {Promise<unknown>}
     * @private
     */
    const _qrInH5 = async (options) => {
        // #ifdef H5
        return new Promise(async (resolve, reject) => {
            try { // 获取屏幕宽度
                const windowWith = window.innerWidth || document.documentElement.offsetWidth
                const windowHeight = window.innerHeight || document.documentElement.offsetHeight
                html5QrCode = new Html5Qrcode("reader");
                const cameras = await Html5Qrcode.getCameras();
                await html5QrCode.start(
                    cameras[cameras.length - 1].id,
                    {
                        fps: 1,
                        aspectRatio: windowHeight / windowWith
                    },
                    (decodedText, decodedResult) => {
                        // do something when code is read
                        resolve(decodedText)
                        html5QrCode.stop()
                    }
                )
                uni.hideLoading()
            } catch (e) {
                reject(e)
            }
        })
        // #endif
    }

    /**
     * 取消扫描
     */
    const cancelScan = () => {
        html5QrCode && html5QrCode.stop()
    }

    return {
        qrCodeScan,
        cancelScan
    }
}

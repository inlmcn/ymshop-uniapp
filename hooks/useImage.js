/**
 * @name: useImage
 * @author: kahu4
 * @date: 2023-11-07 16:34
 * @description：useImage
 * @update: 2023-11-07 16:34
 * */

export function useImage() {

    /**
     *  options?: PreviewImageOptions
     * @param options {PreviewImageOptions}
     * @returns {Promise<unknown>}
     */
    function preview(options) {
        return new Promise((resolve, reject) => {
            uni.previewImage({
                indicator: 'default',
                loop: true,
                ...options,
                success: () => resolve(true),
                fail: (err) => reject(err)
            })
        })
    }

    /**
     * 获取图片信息
     * @param src
     * @returns {Promise<GetImageInfoSuccessData>}
     */
    function getImageInfo(src) {
        return new Promise((resolve, reject) => {
            uni.getImageInfo({
                src,
                success: (res) => {
                    resolve(res)
                },
                fail: (error) => {
                    reject(error)
                }
            })
        })
    }

    /**
     * base64转换为path
     * @param base64Data
     * @returns {Promise<unknown>}
     */
    function base64ToUrl(base64Data) {
        return new Promise((resolve, reject) => {
            // #ifdef H5
            // 构建blob对象 data:image/png;base64,
            const indexOf = base64Data.indexOf('base64,');
            base64Data = base64Data.slice(indexOf + 7)
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {type: 'image/png'});
            // 创建一个链接指向这个blob
            const url = URL.createObjectURL(blob);
            resolve(url)
            // #endif
            // #ifdef MP-WEIXIN
            const time = new Date().getTime();
            const imgPath = wx.env.USER_DATA_PATH + "/poster" + time + "share" + ".png";
            //如果图片字符串不含要清空的前缀,可以不执行下行代码.
            const imageData = base64Data.replace(/^data:image\/\w+;base64,/, "");
            const file = wx.getFileSystemManager();
            file.writeFileSync(imgPath, imageData, "base64");
            resolve(imgPath)
            // #endif
            // #ifdef APP-PLUS
            const bitmap = new plus.nativeObj.Bitmap('test');
            bitmap.loadBase64Data(
                base64Data,
                function () {
                    const url = '_doc/' + new Date() + '.png'; // url建议用时间戳命名方式
                    console.log('url:', url);
                    bitmap.save(
                        url,
                        {
                            overwrite: true // 是否覆盖
                            // quality: 'quality'  // 图片清晰度
                        },
                        i => {
                            resolve(url)
                        },
                        e => {
                            bitmap.clear();
                            reject(e)
                        }
                    );
                },
                e => {
                    bitmap.clear();
                    reject(e)
                }
            );
            // #endif
        })
    }


    /**
     * 保存图片到相册
     * @param filePath
     * @param name h5海报名称
     * @returns {Promise<unknown>}
     */
    function saveImageToPhotosAlbum(filePath, name = '') {
        return new Promise((resolve, reject) => {
            // #ifndef H5
            uni.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                    uni.saveImageToPhotosAlbum({
                        filePath,
                        success() {
                            resolve(true)
                        }
                    })
                }
            })
            // #endif
            // #ifdef H5
            // 创建一个下载链接
            const link = document.createElement('a');
            link.href = filePath;
            link.download = name;
            // 添加它到DOM并触发点击
            document.body.appendChild(link);
            link.click();
            // 确保我们释放这个URL以防止内存泄漏
            document.body.removeChild(link);
            window.URL.revokeObjectURL(filePath);
            resolve(true)
            // #endif
        })
    }

    return {
        preview,
        getImageInfo,
        base64ToUrl,
        saveImageToPhotosAlbum
    }
}

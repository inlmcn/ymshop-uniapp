/**
 * @FileDescription: 微信工具类
 * @Author: kahu
 * @Date: 2023/6/29
 * @LastEditors: kahu
 * @LastEditTime: 2023/6/29
 */

/**
 * 拍摄或从手机相册中选择图片或视频
 * @param options
 * @param options.count 数量 最大选取数量 最多可以选择的文件个数，基础库2.25.0前，最多可支持9个文件，2.25.0及以后最多可支持20个文件
 * @param options.mediaType 选取类型 image图片 video视频
 * @param options.sourceType 选取的方式 album相册 camera相机
 * @param options.maxDuration 录取视频的最大秒数，时间范围为 3s 至 60s 之间。不限制相册
 * @param options.sizeType 是否压缩所选内容，基础库2.25.0前仅对 mediaType 为 image 时有效，2.25.0及以后对全量 mediaType 有效
 * @param options.camera 拍摄时候的摄像头，仅在 sourceType 为 camera 时生效，使用前置或后置摄像头
 */
export function wxChooseMedia(options={}){
    return new Promise((resolve, reject) => {
        const mergeOptions = {
            count:9,
            mediaType:['image','video'],
            sourceType:['album','camera'],
            maxDuration:10,
            sizeType:['original','compressed'],
            camera:'back',
            ...options,
            success:(res)=>{
                resolve(res)
            },
            fail:(err)=>{
                reject(err)
            }
        }
        wx.chooseMedia(mergeOptions)
    })
}

/**
 * 调用微信接口编辑图片
 * @param src 被编辑图片的临时路径
 */
export function wxEditImage(src){
    return new Promise((resolve, reject)=>{
        wx.editImage({
            src,
            success:(res)=>{
                resolve(res.tempFilePath)
            },
            fail:(err)=>{
                reject(err)
            }
        })
    })
}

/**
 * 调用微信接口裁剪图片
 * @param options
 * @param options.src 被裁剪图片的临时路径
 * @param options.cropScale 裁剪比例
 */
export function wxCropImage(options){
    return new Promise((resolve, reject) => {
        const mergeOptions = {
            cropScale:'1:1',
            ...options,
            success:(res)=>{
                resolve(res.tempFilePath)
            },
            fail:(err)=>{
                reject(err)
            }
        }
        wx.cropImage(mergeOptions)
    })
}

/**
 * 调用微信接口处理视频
 * @param options
 * @param options.filePath 视频的本地路径
 * @param options.minDuration 视频的最小长度
 * @param options.maxDuration 视频的最大长度
 * @return { Promise<{duration:number,size:number,tempFilePath:string,tempThumbPath:string}> }
 */
export function wxEditVideo(options){
    return new Promise((resolve, reject)=>{
        if(options.minDuration>=options.maxDuration)return reject('MaxDuration Must Greater Than MinDuration')
        wx.openVideoEditor({
            ...options,
            success:(res)=>{
                resolve(res)
            },
            fail:(err)=>{
                reject(err)
            }
        })
    })
}


/**
 * 获取视频的详情
 * @param src
 */
export function wxGetVideoInfo(src){
    return new Promise((resolve, reject)=>{
        wx.getVideoInfo({
            src,
            success:(res)=>{
                resolve(res)
            },
            fail:(err)=>{
                reject(err)
            }
        })
    })
}

/**
 * 获取照片的详情
 * @param src
 */
export function wxGetImageInfo(src){
    return new Promise((resolve, reject)=>{
        wx.getImageInfo({
            src,
            success:(res)=>{
                resolve(res)
            },
            fail:(err)=>{
                reject(err)
            }
        })
    })
}

/**
 * 调用微信login获取code
 */
export function wxLogin(){
    return new Promise((resolve, reject)=>{
        uni.login({
            provider: 'weixin',
            success: (res) => {
                resolve(res.code)
            },
            fail: (err) => {
                reject({
                    message:'微信login方法出现错误',
                    data:err
                })
            }
        })
    })
}

/**
 * 调用微信getUserProfile获取encryptedData、iv
 */
export function wxGetUserProfile(){
    return new Promise((resolve, reject)=> {
        uni.getUserProfile({
            desc: '用于完善用户信息',
            success: ({ encryptedData, iv }) => {
                resolve({encryptedData,iv})
            },
            fail:(err)=>{
                console.log(err)
                reject({
                    message:'微信getUserProfile方法出现错误',
                    data:err
                })
            }
        })
    })
}


/**
 * 调用地图获取位置信息
 * @param params
 */
export function wxChooseLocation(params){
    return new Promise((resolve, reject)=>{
        const obj = {
            success(e){
                resolve(e)
            },
            fail(err){
                console.log(err)
                reject({
                    message:'微信ChooseLocation方法出现错误',
                    data:err
                })
            }
        }
        Object.keys(params).forEach(key=>{
            // @ts-ignore
            obj[key] = params[key]
        })
        uni.chooseLocation(obj)
    })
}

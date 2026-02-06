import { useInterface } from "@/hooks/useInterface";

/**
 * @name: mapUtils
 * @author: kahu4
 * @date: 2024-01-21 14:11
 * @description：mapUtils
 * @update: 2024-01-21 14:11
 * */
export const mapUtils = {
    mapList: [
        {name: '高德地图'},
        {name: '百度地图'},
        // #ifdef H5
        {name: '腾讯地图'},
        // #endif
    ]
}
export const openMap = (options) => {
    // #ifdef MP-WEIXIN
    _openInWechat(options)
    // #endif
    // #ifdef H5
    _openInH5(options)
    // #endif
    // #ifdef APP-PLUS
    _openInApp(options)
    // #endif
}


/**
 * 微信小程序中打开地图
 * @param options
 * @return {Promise<unknown>}
 */
const _openInWechat = (options) => {
    return new Promise((resolve, reject) => {
        uni.openLocation({
            latitude: options.lat,
            longitude: options.lon,
            scale: 15,
            success: () => {
                resolve(true)
            },
            fail: (err) => {
                reject(err)
            }
        });
    })
}

/**
 * h5打开地图导航
 * @param options
 * @private
 */
const _openInH5 = (options) => {
    const {lat, lon, type, address} = options;
    let url = '';
    switch (type) {
        case '腾讯地图':
            url = 'https://apis.map.qq.com/uri/v1/marker?marker=coord:' + lat + ',' + lon + ';addr:' + address + ';title:地址&referer=keyfree';
            break;
        case '高德地图':
            url = 'https://uri.amap.com/marker?position=' + lon + ',' + lat + '&name=' + address + '&callnative=1';
            break;
        case '百度地图':
            url = 'http://api.map.baidu.com/marker?location=' + lat + ',' + lon + '&title=地址&content=' + address + '&output=html&src=webapp.reformer.appname&coord_type=gcj02';
            break;
        default:
            break;
    }
    window.open(url, '_blank')
}

const {toast} = useInterface()
/**
 * APP打开地图
 * @param options
 * @return {*}
 * @private
 */
const _openInApp = (options) => {
    const {lat, lon, type, address} = options;
    const osName = plus.os.name.toLowerCase()
    const urlBaiduMap = 'baidumap://map/marker?location=' + lat + ',' + lon + '&title=' + encodeURIComponent(address) + '&src=com.bailb.hbb';
    const urlAMap = 'androidamap://viewMap?sourceApplication=com.bailb.hbb&poiname=' + encodeURIComponent(address) + '&lat=' + lat + '&lon=' + lon + '&dev=0';
    // 安卓
    if (osName === 'android') {
        const hasBaiduMap = plus.runtime.isApplicationExist({pname: 'com.baidu.BaiduMap', action: 'baidumap://'});
        const hasAMap = plus.runtime.isApplicationExist({pname: 'com.autonavi.minimap', action: 'androidamap://'});
        if (type === '高德地图' && !hasAMap) return toast({title: '手机未安装高德地图'})
        if (type === '百度地图' && !hasBaiduMap) return toast({title: '手机未安装百度地图'})
        if (type === '高德地图') {
            plus.runtime.openURL(urlAMap);
        } else {
            plus.runtime.openURL(urlBaiduMap);
        }
        return
    }
    // IOS
    if (osName === 'ios') {
        if (type === '高德地图') {
            plus.runtime.openURL(urlAMap, e => {
                plus.nativeUI.alert('本机未安装指定的地图应用');
            });
        } else {
            plus.runtime.openURL(urlBaiduMap, e => {
                plus.nativeUI.alert('本机未安装指定的地图应用');
            });
        }
    }
}

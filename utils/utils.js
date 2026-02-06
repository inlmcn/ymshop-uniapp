import { getAddressCityList } from '@/api/address'

// 省市区数据（从服务器加载）
let levelData = null
let levelDataPromise = null

/**
 * 获取省市区数据（懒加载，仅在需要时请求）
 */
async function getLevelData() {
    if (levelData) return levelData
    if (levelDataPromise) return levelDataPromise
    
    levelDataPromise = getAddressCityList().then(res => {
        levelData = res
        return levelData
    }).catch(err => {
        console.error('加载省市区数据失败:', err)
        levelDataPromise = null  // 失败后允许重试
        return null
    })
    
    return levelDataPromise
}

export function formatDate(date, format) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return format
        .replace(/yyyy/g, year)
        .replace(/MM/g, month)
        .replace(/dd/g, day)
        .replace(/HH/g, hours)
        .replace(/mm/g, minutes)
        .replace(/ss/g, seconds);
}

export function formatRemainTime(time) {
    let remainTimeStr = ''
    const seconds = Math.floor(time / 1000)
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    // const minutes = Math.floor((seconds % 3600) / 60)
    // const remainingSeconds = seconds % 60
    if (days > 0) {
        remainTimeStr += `${ days }天`
    }
    if (hours > 0) {
        remainTimeStr += `${ hours }小时`
    }
    return `还剩${ remainTimeStr }自动确认`
}


/**
 * 创建一个滚动动画
 * @param scrollStart 动画开始滚动位置
 * @param scrollEnd 动画结束滚动位置
 * @param valueStart 动画值开始值
 * @param valueEnd 动画值结束值
 */
export function createAnimation(scrollStart, scrollEnd, valueStart, valueEnd) {
    return function (nowScroll) {
        if (nowScroll <= scrollStart) {
            return valueStart
        }
        if (nowScroll >= scrollEnd) {
            return valueEnd
        }
        // (nowScroll - scrollStart) / (scrollEnd - scrollStart) 当前滚动在咕哝的那个起始值中的比例
        // 用value的总值 * 比例 = value的值
        // 由于valueStart可能不是0 ， 所以需要加上valueStart
        return ((valueEnd - valueStart) * (nowScroll - scrollStart) / (scrollEnd - scrollStart)) + valueStart
    }
}

/**
 * 从数组中找到比较项并且删除
 * @param originalList 原数组
 * @param compareItem 比较项目
 * @param field 比较字段
 */
export function compareToDelListItem(originalList, compareItem, field) {
    const delIndex = originalList.findIndex((item) => item[field] === compareItem[field]);
    if (delIndex >= 0) {
        originalList.splice(delIndex, 1);
        return true
    }
    return false
}

/**
 * 过滤File类型
 * @param file
 * @param excludeTypeArr 需要排除的类型
 */
export function filterFileType(file, excludeTypeArr) {
    let suffix, name
    // #ifndef MP-WEIXIN
    name = file.name
    suffix = name.slice(name.lastIndexOf('.') + 1)
    // #endif
    // #ifdef MP-WEIXIN
    name = file.url
    suffix = name.slice(name.lastIndexOf('.') + 1)
    // #endif
    return excludeTypeArr.includes(suffix)
}

/**
 * 阿拉伯数字转换中文数字
 * @param number
 */
export function arabicToChinese(number) {
    const chineseNumberMap = {
        0: '零',
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '七',
        8: '八',
        9: '九',
        10: '十'
    };

    const chineseUnitMap = {
        10: '十',
        100: '百',
        1000: '千',
        10000: '万',
        100000: '十万',
        1000000: '百万',
        10000000: '千万',
        100000000: '亿',
        1000000000: '十亿',
        10000000000: '百亿',
        100000000000: '千亿',
        1000000000000: '兆'
    };

    if (number <= 10) {
        return chineseNumberMap[number]
    }

    let chineseNumber = '';
    let num = number;
    for (let unit of [1000000000000, 100000000000, 10000000000, 1000000000, 100000000, 10000000, 1000000, 100000, 10000, 1000, 100, 10, 1]) {
        if (num >= unit) {
            let count = Math.floor(num / unit);
            chineseNumber += chineseNumberMap[count] + (chineseUnitMap[unit] ? chineseUnitMap[unit] : '');
            num %= unit; // 取余
        } else if (chineseNumber !== '') {
            chineseNumber += chineseNumberMap[0]; // 添加零，保持位数对齐
        }
    }
    return chineseNumber;
}


export function hasNetWork() {
    return new Promise < boolean > ((resolve, reject) => {
        wx.getNetworkType({
            success(res) {
                console.log(res);
                if (res.networkType === 'none') {
                    resolve(false)
                } else {
                    resolve(true)
                }
            }
        })
    })
}

/**
 * 获取两数之间的随机数
 * @param min
 * @param max
 */
export function getRandom(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

/**
 * 计算未来时间距离当前时间的时间对象
 * @param futureTime 未来时间的时间戳（毫秒）
 */
export function getTimeAfterNow(futureTime) {
    const nowTime = Date.now()
    const timeDiff = futureTime - nowTime // 时间差
    if (timeDiff <= 0) {
        return {
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00'
        }
    }
    let hours = Math.floor((timeDiff) / (1000 * 60 * 60));
    let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
    }
}

/**
 * 生成本周的日历
 * @return {Date[]}
 */
export function generationWeek() {
    const MillisecondsOfTheDay = 24 * 60 * 60 * 1000 // 一天的毫秒数
    let today = new Date();
    let dayOfTheWeek = today.getDay(); // 当前天在本周的位置
    let calendar = []
    let startOfWeek = new Date(today - (dayOfTheWeek * MillisecondsOfTheDay) + MillisecondsOfTheDay); // 本周开始的位置
    for (let i = 0; i < 7; i++) {
        let day = new Date(startOfWeek.getTime() + i * MillisecondsOfTheDay);
        calendar.push(day)
    }
    return calendar
}


/**
 * @description: 对象转query串
 * @param {*} obj
 * @param {*} noFilterEmpty 默认false 去除空值再拼接字符串
 * @return {*}
 */
export const getQueryString = (obj, noFilterEmpty = false) => {
    if (!obj) return '';

    let newObj = {...obj};
    if (!noFilterEmpty) {
        newObj = filterParams(newObj)
    }
    return new URLSearchParams(Object.entries(newObj)).toString()
}

/**
 * @description: query串转对象
 * 支持小程序
 * @param query
 */
export const getUrlQuery = (query) => {
    if (!query) return
    if (query.indexOf("?") > 0) {
        query = query.split("?").at(-1) // 选取?后面的
    }
    const queryList = query.split("&").map(item => item.split("="))
    const entries = new Map(queryList);
    return Object.fromEntries(entries);
}

/**
 * @description: 去除对象中的空值
 * @param {*} obj
 * @return {*}
 */
export const filterParams = (obj) => {
    let newObj = {};
    for (const key in obj) {
        //如果对象属性的值不为空，就保存该属性（如果属性的值为0 false，保存该属性。如果属性的值全部是空格，属于为空。）
        if ((obj[key] === 0 || obj[key] === false || obj[key]) && obj[key].toString().replace(/(^\s*)|(\s*$)/g, '') !== '') {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

export const checkPhone = (phone) => {
    return /^1[3456789]\d{9}$/.test(phone)
}

/**
 * 将productValue中第一个SKU的price赋值给父级的price
 * @param {Array|Object} products - 产品数组或单个产品对象
 * @returns {Array|Object} 处理后的产品数据
 */
export const syncProductPriceFromProductValue = (products) => {
    if (!products) return products;
    
    // 如果是数组，遍历处理每个产品
    if (Array.isArray(products)) {
        return products.map(product => {
            if (product && product.productValue && typeof product.productValue === 'object') {
                // 获取productValue的第一个键
                const firstKey = Object.keys(product.productValue)[0];
                if (firstKey && product.productValue[firstKey] && product.productValue[firstKey].price !== undefined) {
                    // 将第一个SKU的price赋值给父级的price
                    product.price = product.productValue[firstKey].price;
                }
            }
            return product;
        });
    }
    
    // 如果是单个对象
    if (products.productValue && typeof products.productValue === 'object') {
        const firstKey = Object.keys(products.productValue)[0];
        if (firstKey && products.productValue[firstKey] && products.productValue[firstKey].price !== undefined) {
            products.price = products.productValue[firstKey].price;
        }
    }
    
    return products;
}

export function formatSoldCount(count) {
    let n = Number(count)
    if (!Number.isFinite(n)) n = 0
    if (n < 0) n = 0
    if (n >= 10000) {
        const v = Math.floor((n / 10000) * 10) / 10
        const s = v.toFixed(1)
        return `已售${s}万+`
    }
    return `已售${n}`
}

// 构建省市区索引（用于快速匹配）
let areaIndex = null
async function buildAreaIndex() {
    if (areaIndex) return areaIndex
    
    // 获取省市区数据
    const data = await getLevelData()
    if (!data) return null
    
    areaIndex = {
        provinces: [],      // 省份列表
        cities: [],         // 城市列表
        districts: [],      // 区县列表
        provinceMap: {},    // 省份名 -> 省份对象
        cityMap: {},        // 城市名 -> { province, city, cityId }
        districtMap: {}     // 区县名 -> { province, city, cityId, district }
    }
    
    // 直辖市列表（后端数据中直辖市名称没有"市"后缀）
    const directCities = ['北京', '天津', '上海', '重庆']
    
    for (const province of data) {
        const provName = province.name
        areaIndex.provinces.push(provName)
        areaIndex.provinceMap[provName] = province
        
        // 添加省份简称匹配（去掉"省"、"自治区"等后缀）
        const provShort = provName.replace(/省|自治区|特别行政区/g, '')
        if (provShort !== provName) {
            areaIndex.provinceMap[provShort] = province
        }
        
        // 后端数据结构：省 -> 市 -> 区（三级）
        // 直辖市也是三级：北京 -> 北京市 -> 区县
        for (const city of (province.children || [])) {
            const cityName = city.name
            const cityId = city.id
            areaIndex.cities.push(cityName)
            areaIndex.cityMap[cityName] = {
                province: provName,
                city: cityName,
                cityId: cityId
            }
            
            // 添加城市简称匹配
            const cityShort = cityName.replace(/市|地区|自治州|盟/g, '')
            if (cityShort !== cityName) {
                areaIndex.cityMap[cityShort] = {
                    province: provName,
                    city: cityName,
                    cityId: cityId
                }
            }
            
            // 区县
            for (const district of (city.children || [])) {
                const distName = district.name
                areaIndex.districts.push(distName)
                areaIndex.districtMap[distName] = {
                    province: provName,
                    city: cityName,
                    cityId: cityId,
                    district: distName
                }
            }
        }
    }
    
    // 按长度降序排序，优先匹配长名称
    areaIndex.provinces.sort((a, b) => b.length - a.length)
    areaIndex.cities.sort((a, b) => b.length - a.length)
    areaIndex.districts.sort((a, b) => b.length - a.length)
    
    return areaIndex
}

export async function parseAddress(text) {
    if (!text) return null

    // 去除常用关键词
    text = text
        .replace(/收货人|收件人|联系人|姓名|名字/gi, '')
        .replace(/电话|手机号|联系方式|手机/gi, '')
        .replace(/地址|收货地址/gi, '')
        .replace(/[：:]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    const result = {
        realName: '',
        phone: '',
        province: '',
        city: '',
        cityId: '',
        district: '',
        detail: ''
    }

    // 1. 提取手机号
    const phoneMatch = text.match(/1[3-9]\d{9}/)
    if (phoneMatch) {
        result.phone = phoneMatch[0]
    }

    // 2. 构建索引并匹配省市区
    const index = await buildAreaIndex()
    if (!index) return result  // 如果加载失败，返回已解析的手机号
    
    // 尝试匹配省份
    for (const prov of index.provinces) {
        if (text.includes(prov)) {
            result.province = prov
            break
        }
    }
    
    // 如果没匹配到省份，尝试简称
    if (!result.province) {
        for (const key of Object.keys(index.provinceMap)) {
            if (text.includes(key)) {
                result.province = index.provinceMap[key].name
                break
            }
        }
    }

    // 尝试匹配城市
    for (const city of index.cities) {
        if (text.includes(city)) {
            const cityInfo = index.cityMap[city]
            // 如果已有省份，验证城市是否属于该省
            if (!result.province || cityInfo.province === result.province) {
                result.city = cityInfo.city
                result.cityId = cityInfo.cityId
                if (!result.province) result.province = cityInfo.province
                break
            }
        }
    }
    
    // 如果没匹配到城市，尝试简称（如"深圳"匹配"深圳市"）
    if (!result.city) {
        for (const key of Object.keys(index.cityMap)) {
            if (text.includes(key)) {
                const cityInfo = index.cityMap[key]
                if (!result.province || cityInfo.province === result.province) {
                    result.city = cityInfo.city
                    result.cityId = cityInfo.cityId
                    if (!result.province) result.province = cityInfo.province
                    break
                }
            }
        }
    }

    // 尝试匹配区县
    for (const dist of index.districts) {
        if (text.includes(dist)) {
            const distInfo = index.districtMap[dist]
            // 验证区县是否属于已匹配的省市
            const provMatch = !result.province || distInfo.province === result.province
            const cityMatch = !result.city || distInfo.city === result.city
            if (provMatch && cityMatch) {
                result.district = distInfo.district
                if (!result.province) result.province = distInfo.province
                if (!result.city) {
                    result.city = distInfo.city
                    result.cityId = distInfo.cityId
                }
                break
            }
        }
    }

    // 3. 提取姓名（排除法：去掉已识别的部分，在剩余文本中找姓名）
    const addressKeywords = /街道|路|号|栋|楼|室|单元|村|小区|花园|大厦|广场|中心|新村|组|巷|弄|幢|座|层|期|东|西|南|北/
    
    // 构建一个去除了手机号和省市区的文本
    let textForName = text
    if (result.phone) textForName = textForName.replace(result.phone, ' ')
    if (result.province) textForName = textForName.replace(result.province, ' ')
    if (result.city) textForName = textForName.replace(result.city, ' ')
    if (result.district) textForName = textForName.replace(result.district, ' ')
    
    // 也去除简称
    if (result.province) {
        const provShort = result.province.replace(/省|自治区|特别行政区/g, '')
        if (provShort !== result.province) textForName = textForName.replace(provShort, ' ')
    }
    if (result.city) {
        const cityShort = result.city.replace(/市|地区|自治州|盟/g, '')
        if (cityShort !== result.city) textForName = textForName.replace(cityShort, ' ')
    }
    
    // 按分隔符拆分，找出所有可能的姓名候选
    const segments = textForName.split(/[,，、\s]+/).filter(s => s.length >= 2 && s.length <= 4)
    
    // 在候选中找不含地址关键词的2-4个汉字
    for (const seg of segments) {
        const nm = seg.match(/^[\u4e00-\u9fa5]{2,4}$/)
        if (nm && !addressKeywords.test(nm[0])) {
            result.realName = nm[0]
            break
        }
    }
    
    // 如果分隔符方式没找到，尝试正则匹配所有2-4汉字片段
    if (!result.realName) {
        const allMatches = textForName.match(/[\u4e00-\u9fa5]{2,4}/g) || []
        for (const nm of allMatches) {
            if (!addressKeywords.test(nm)) {
                result.realName = nm
                break
            }
        }
    }

    // 4. 提取详细地址（去除已识别的部分）
    let detailText = text
    const toRemove = [result.realName, result.phone, result.province, result.city, result.district]
    toRemove.forEach(k => {
        if (k) detailText = detailText.replace(k, '')
    })
    
    // 也尝试去除省市简称
    if (result.province) {
        const provShort = result.province.replace(/省|自治区|特别行政区/g, '')
        if (provShort !== result.province) detailText = detailText.replace(provShort, '')
    }
    if (result.city) {
        const cityShort = result.city.replace(/市|地区|自治州|盟/g, '')
        if (cityShort !== result.city) detailText = detailText.replace(cityShort, '')
    }

    // 清理残留的标点符号、空白和单独的行政区划后缀
    result.detail = detailText
        .replace(/^[,，、\s省市区县]+/, '')  // 去除开头的逗号、顿号、空白及残留的省市区县字
        .replace(/[,，、\s]+$/, '')  // 去除结尾的逗号、顿号、空白
        .replace(/\s+/g, '')
        .trim()

    return result
}

export function formatNumber(num) {
  // 如果数字小于1000，直接显示
  if (num < 1000) {
    return num.toString();
  }
  
  if(num<10000){
	  // 计算是第几个1000
	  const thousands = Math.floor(num / 1000);
	  
	  // 返回 `${thousands}000+`
	  return `${thousands}000+`;
  }else{
	  // 处理万级以上
	      const wan = Math.floor((num / 10000)*10)/10;
	      const remainder = num % 10000;
	      return `${wan}万+`;
  }
}

/**
 * 获取媒体自适应信息（横竖屏处理）
 * @param {number} width 媒体宽度
 * @param {number} height 媒体高度
 * @returns {object} { orientation: 'horizontal'|'vertical', objectFit: 'contain'|'cover', suggestedHeight: string }
 */
export function getMediaAdaptiveInfo(width, height) {
    if (!width || !height) {
        return {
            orientation: 'unknown',
            objectFit: 'cover',
            suggestedHeight: '750rpx'
        };
    }

    const baseWidth = 750;
    const calculatedHeight = Math.floor((baseWidth / width) * height);

    if (width > height) {
        // 横屏 (如 1920*1080)
        // 16:9 比例对应高度为 421.875 -> 422rpx
        const minHeight = 422; 
        const finalHeight = Math.max(calculatedHeight, minHeight);
        
        return {
            orientation: 'horizontal',
            objectFit: 'contain', // 横屏通常用 contain 保持完整
            suggestedHeight: `${finalHeight}rpx`
        };
    } else {
        // 竖屏 (如 1080*1920)
        // 9:16 比例对应高度为 1333.33... -> 1334rpx
        // 设定上限防止在极长屏幕上溢出，1334rpx 是标准的 9:16 高度
        const maxHeight = 1334;
        const finalHeight = Math.min(calculatedHeight, maxHeight);

        return {
            orientation: 'vertical',
            objectFit: 'cover', // 竖屏建议 cover 以填充显示区域
            suggestedHeight: `${finalHeight}rpx`
        };
    }
}

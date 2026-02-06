// mouse.js
import { ref } from 'vue'
import { onReachBottom, onReady } from '@dcloudio/uni-app'
import { formatDate } from '@/utils/utils'

export const useActivity = getPage => {
    // 页码,默认为1
    const page = ref(1)

    // 页大小,默认为10
    const pageSize = ref(10)

    // 到底了
    const loadend = ref(false)

    // 加载中
    const loading = ref(false)

    // 加载中
    const startTime = ref(null)
    // 加载中
    const endTime = ref(null)

    // 是否有数据
    const listEmpty = ref(false)

    const dataList = ref([])

    const otherQuery = ref({})

    const activeIndex = ref(0)
    const timesList = ref([])

    const handleGetDataList = async () => {
        if (loading.value || loadend.value) return

        loading.value = true
        const res = await getPage({
            pageNo: page.value,
            pageSize: pageSize.value,
            startTime: startTime.value,
            endTime: endTime.value,
            ...otherQuery.value
        })
        const products = res.list
        listEmpty.value = false
        console.log(products,'products')
        if (products) {
            if (products.length <= 0) {
                if (page.value === 1) {
                    listEmpty.value = true
                } else {
                    loadend.value = true
                }
            }
            dataList.value = dataList.value.concat(products)
        }
        loading.value = false
    }

    const handleRefresh = async () => {
        loadend.value = false
        loading.value = false
        page.value = 1
        dataList.value = []
        await handleGetDataList()
    }

    // 初始化时间
    const handleGetTimeList = ()=>{
        let now = new Date();
        let nowHours = new Date().getHours()
        for (let i=0;i<4;i++){
            let obj = {
                time: nowHours+i >= 24?`${nowHours+i-24}:00`.padStart(5, '0'):`${nowHours+i}:00`.padStart(5, '0'),
                status: 2,
                countdown: '',
                startTime: '',
                endTime: ''
            }
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            now.setHours(nowHours + i);
            obj.startTime = now.getTime()
            now.setHours(nowHours + i + 1);
            obj.endTime = now.getTime()
            if(i===0){
                obj.status = 1
                obj.countdown = now.getTime() - new Date().getTime()
            }
            timesList.value.push(obj)
        }
        startTime.value = timesList.value[0].startTime
        endTime.value = timesList.value[0].endTime
        handleRefresh()
    }

    // 时间切换
    const timeChange = (item,index)=>{
        activeIndex.value = index
        startTime.value = item.startTime
        endTime.value = item.endTime
        handleRefresh()
    }

    // 倒计时结束
    const countDownFinish = ()=>{
        timesList.value = []
        activeIndex.value = 0
        handleGetTimeList()
    }

    onReachBottom(() => {
        if (loading.value || loadend.value) return
        page.value += 1
        handleGetDataList()
    })

    // 通过返回值暴露所管理的状态
    return {
        dataList,
        page,
        pageSize,
        loading,
        loadend,
        listEmpty,
        refresh: handleRefresh,
        otherQuery,
        activeIndex,
        timesList,
        timeChange,
        countDownFinish,
        handleGetTimeList
    }
}

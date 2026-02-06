import { onLoad, onPageScroll } from "@dcloudio/uni-app";
import { onBeforeUnmount, ref } from "vue";

export function useScroll(){
    const scrollTop = ref(0)

    onPageScroll((e)=>{
        scrollTop.value = e.scrollTop
    })

    onBeforeUnmount(()=>{
        scrollTop.value = 0
    })

    function scrollToTop(){
        uni.pageScrollTo({
            scrollTop: 0,
            duration: 500
        })
    }

    return {
        scrollTop,
        scrollToTop
    }

}

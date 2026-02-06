import { ref, unref} from "vue";
import {useRouter} from "@/hooks/useRouter";

export function usePay() {
    const payPopupRef = ref()
    const { push } = useRouter()

    function openPay(orderId,uid) {
        unref(payPopupRef).show(orderId,uid)
    }


    function paySuccess(uid) {
        let url = '/pages/payStatus/index?type=1'
        if(uid){
            url += `&uid=${uid}`
        }
        push({url})
    }

    return {
        payPopupRef,
        openPay,
        paySuccess
    }
}

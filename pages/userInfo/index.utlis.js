import { useMainStore } from "@/store/modules/useMainStore";
import { useInterface } from "@/hooks/useInterface";
import { updateAvatar, updateUserInfo } from "@/api/user";
import { requestUtil } from "@/utils/request";

export function useRequest() {
    const {loading, hideLoading, toast} = useInterface()
    const userStore = useMainStore()

    /**
     * 请求修改用户头像
     * @param file
     * @returns {Promise<void>}
     */
    async function doUpdateAvatar(file) {
        try {
            await requestUtil.upload({
                url: '/member/user/update-avatar',
                filePath: file.url,
                name: 'avatarFile'
            });
            await userStore.getUserInfo()
        } catch (e) {
            console.error(e)
        }
    }

    async function doUpdateUserInfo() {
        await updateUserInfo(userStore.user)
        await userStore.getUserInfo()
    }

    return {
        doUpdateAvatar,
        doUpdateUserInfo
    }
}

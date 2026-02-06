import { memberVip1, memberVip2, memberVip3, memberVip4, memberVip5 } from "@/utils/images";

export const vipList = [
    {
        label: '普通会员',
        value: 0,
        bg: memberVip1
    },
    {
        label: '白银会员',
        value: 1,
        bg: memberVip2
    },
    {
        label: '黄金会员',
        value: 2,
        bg: memberVip3
    },
    {
        label: '铂金会员',
        value: 3,
        bg: memberVip4
    },
    {
        label: '钻石会员',
        value: 4,
        bg: memberVip5
    }
]

export const EnumTaskButton = {
    CONSUME: 'consume', // 消费
    INVITE: 'invite' // 邀请
}

export const taskButtonLabel = {
    [EnumTaskButton.CONSUME]: '消费',
    [EnumTaskButton.INVITE]: '邀请'
}


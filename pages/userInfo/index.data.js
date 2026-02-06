export const userInfoList = [
    {
        label: 'ID',
        field: 'id',
        type: 'text',
        icon: false
    },
    {
        label: '昵称',
        field: 'nickname',
        type: 'input',
        icon: false
    },
    {
        label: '性别',
        field: 'sex',
        type: 'text',
        icon: true,
        map: {
            0: '女',
            1: '男'
        },
        func: 'openSex'
    }
    ,
    {
        label: '出生日期',
        field: 'birthday',
        type: 'text',
        icon: true,
        func: 'openBirthday'
    }
]

export const userInfoNextList = [
    {
        label: '手机号',
        field: 'mobile',
        type: 'text',
        icon: false
    }
]


export const sexColumns = [
    [{label: '男', value: 1}, {label: '女', value: 0}]
]


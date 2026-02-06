## 关于订单状态

```java
    // STATUS
    STATUS_APPLY_REFUND(-1,"申请退款"),
	STATUS_REFUND_SUCCESS(-2,"退款成功"),
	STATUS_GROUP_FAILURE(-4,"成团失败"),
	STATUS_DEFAULT(0,"默认"),
	STATUS_WAIT_RECEIVED(1,"待收货"),
	STATUS_RECEIVED(2,"已收货"),
	STATUS_FINISHED(3,"已完成"),
	STATUS_CANCEL(4,"取消"),
	STATUS_WAIT_GROUP(5,"待成团"),
```

```java
    STATUS_ALL(-1,"全部订单"),
	STATUS_WAIT_PAY(0,"未支付"),
	STATUS_WAIT_SEND(1,"未发货"),
	STATUS_WAIT_RECEIVED(2,"待收货"),
	STATUS_WAIT_EVALUATE(3,"待评价"),
	STATUS_FINISH(4,"已完成"),
	STATUS_WAIT_FOR_GROUP(5,"待成团"),
```

` _type: -1申请退款 -2退款成功 2待收货 3已收货 4已完成 5已取消 6待成团 7成团失败 8待发货 `

### 关于订单相关状态button显示

1. 取消订单
    2. orderInfoData._status._type==='0'
2. 立即付款
    3. orderInfoData._status._type==='0'
3. 申请退款
    4. 当不是核销订单、且orderInfoData._status._type为1，2，3，4，6，8
    5. 或者是核销订单、且orderInfoData._status._type为6
    6. 时候展示
    7. (shippingType===1&&['1','2','3','4','8','6'].includes(orderInfoData._status._type)) || (shippingType===2&&['6']
       .includes(orderInfoData._status._type))
4. 核销订单取消订单
    5. 当是核销订单且状态为8
    6. (shippingType ===2 && ['8'].includes(orderInfoData._status._type))
5. 核销码
    6. 同核销订单取消订单
6. 删除订单
    7. orderInfoData._status._type包含4，5，-2
7. 确认收货
    8. orderInfoData._status._type为2
8. 邀请好友拼团
    9. orderInfoData._status._type为6

## 关于下单

1. submitOrder.vue load 活动下单参数
    2. orderType 1普通下单 2活动下单
    3. campaignType 1拼团 2秒杀 3砍价
    4. campaignDetailId 活动营销ID
    5. campaignType 1拼团活动 2秒杀活动 3砍价活动 如果campaignType===1 下单接口就要传teamworkType // 1发起拼团 2加入 和
       teamworkId // 加入拼团的id
2. shippingType
    3. 1快递
    4. 2到店自提

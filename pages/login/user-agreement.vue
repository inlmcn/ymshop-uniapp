<template>
  <view class="agreement-container">
    <Header
      :showReturn="true"
      :headerAreaBg="'#fff'"
      :headerAreaTextColor="'#333'"
      :bgChangeByScroll="false"
      :propUp="true"
    >
      <template #default>
        <text class="header-title">用户协议</text>
      </template>
    </Header>
    <view class="agreement-content">
      <view class="section">
        <text class="section-title">1. 服务条款的确认和接纳</text>
        <text class="section-content">
          欢迎使用HealthCoast商城平台服务。用户通过注册、登录、使用HealthCoast商城平台服务，表示用户与HealthCoast商城平台已达成协议，自愿接受本服务条款所有内容的约束。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">2. 服务内容</text>
        <text class="section-content">
          HealthCoast商城平台为用户提供网上购物服务、信息发布、交易撮合等电子商务服务。HealthCoast商城平台有权随时修改或中断服务而不需通知用户。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">3. 用户账户</text>
        <text class="section-content">
          3.1 用户需提供真实、准确、完整的个人资料，如资料有任何变动，必须及时更新。
          3.2 用户应对其账户密码安全负全部责任，因用户保管不善导致密码被盗造成的损失，HealthCoast商城平台不承担任何责任。
          3.3 用户发现其账户被他人非法使用，应立即通知HealthCoast商城平台。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">4. 商品信息</text>
        <text class="section-content">
          4.1 HealthCoast商城平台上的商品价格、数量、是否有货等商品信息随时都有可能发生变动，HealthCoast商城平台不作特别通知。
          4.2 HealthCoast商城平台尽最大努力确保您在HealthCoast商城平台上浏览的商品信息的准确性，但由于商品种类繁多，商品信息的数量庞大，加上互联网技术因素等客观原因影响，网页显示的信息可能会有一定的滞后性或差错。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">5. 订单</text>
        <text class="section-content">
          5.1 在您下订单时，请您仔细确认所购商品的名称、价格、数量、型号、规格、收货人信息、联系电话、收货地址等信息。
          5.2 除法律另有强制性规定外，双方约定如下：HealthCoast商城平台上展示的商品和价格等信息仅仅是要约邀请，您下单时填写您的联系方式等信息并成功提交订单即表示您对订单内容的确认，您的订单内容将成为您向HealthCoast商城平台发出的购买要约。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">6. 配送</text>
        <text class="section-content">
          6.1 HealthCoast商城平台将会把商品送到您所指定的收货地址，所有在HealthCoast商城平台上列出的送货时间为参考时间，参考时间的计算是根据库存状况、正常的处理过程和送货时间、送货地点的基础上估计得出的。
          6.2 因如下情况造成订单延迟或无法配送等，HealthCoast商城平台不承担延迟配送的责任：
          （1）用户提供的信息错误、地址不详细等原因导致的；
          （2）货物送达后无人签收，导致无法配送或延迟配送的；
          （3）情势变更因素导致的；
          （4）不可抗力因素导致的，例如：自然灾害、交通戒严、突发战争等。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">7. 隐私政策</text>
        <text class="section-content">
          HealthCoast商城平台尊重并保护所有使用服务用户的个人隐私权。为了给您提供更准确、更有个性化的服务，HealthCoast商城平台会按照本隐私政策的规定使用和披露您的个人信息。但HealthCoast商城平台将以高度的勤勉、审慎义务对待这些信息。除本隐私政策另有规定外，在未征得您事先许可的情况下，HealthCoast商城平台不会将这些信息对外披露或向第三方提供。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">8. 知识产权</text>
        <text class="section-content">
          HealthCoast商城平台上所有内容，包括但不限于文字、图片、音频、视频、图表、标识、广告、商标、商号、域名、软件、程序、版面设计、专栏目录与名称、内容分类标准等，均由HealthCoast商城平台或其关联公司依法拥有知识产权，受法律保护。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">9. 免责声明</text>
        <text class="section-content">
          9.1 HealthCoast商城平台不保证网络服务的及时性、安全性、准确性，亦不保证网络服务不会中断。
          9.2 对于因不可抗力或HealthCoast商城平台不能控制的原因造成的网络服务中断或其他缺陷，HealthCoast商城平台不承担任何责任。
          9.3 用户明确同意其使用HealthCoast商城平台网络服务所存在的风险将完全由其自己承担。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">10. 协议修改</text>
        <text class="section-content">
          HealthCoast商城平台有权随时修改本协议条款，用户在使用HealthCoast商城平台服务时，应当及时查阅了解修改的内容，并自觉遵守本协议的相关内容。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">11. 争议解决</text>
        <text class="section-content">
          本协议条款的解释权归HealthCoast商城平台所有。如果用户与本平台发生争议，应友好协商解决，协商不成的，任何一方均可向本平台所在地人民法院提起诉讼。
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue';
import Header from '@/components/Header/index.vue';

onMounted(() => {
  uni.setNavigationBarTitle({
    title: '用户协议'
  });
});
</script>

<style scoped>
.agreement-container {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}



.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.agreement-content {
  padding: 30rpx;
  background-color: #fff;
}

.section {
  margin-bottom: 40rpx;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.section-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  text-align: justify;
}
</style>
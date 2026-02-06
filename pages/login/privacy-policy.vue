<template>
  <view class="privacy-container">
    <Header
      :showReturn="true"
      :headerAreaBg="'#fff'"
      :headerAreaTextColor="'#333'"
      :bgChangeByScroll="false"
      :propUp="true"
    >
      <template #default>
        <text class="header-title">隐私政策</text>
      </template>
    </Header>
    <view class="privacy-content">
      <view class="section">
        <text class="section-title">引言</text>
        <text class="section-content">
          HealthCoast商城（以下简称"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。同时，我们承诺，我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">一、我们如何收集和使用您的个人信息</text>
        <text class="section-content">
          我们仅会出于本政策所述的以下目的，收集和使用您的个人信息：
          
          1.1 注册与账户管理
          当您注册账户时，我们需要收集您的手机号码、验证码，我们将通过发送短信验证码的方式来验证您的身份是否有效。
          
          1.2 商品与/或服务展示
          为了向您展示最适合您的商品或服务，我们会收集和使用您在使用我们服务时的设备信息、浏览记录、订单信息、收藏信息等。
          
          1.3 下单与支付
          当您准备购买商品或服务时，我们会收集您的收货人姓名、收货地址、联系电话、支付信息等。
          
          1.4 客服与售后
          当您与我们联系时，我们会保存您的通信/通话记录和内容，以及您与我们的联系方式，以便帮助您解决问题，或记录相关问题的处理方案及结果。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">二、我们如何使用Cookie和同类技术</text>
        <text class="section-content">
          2.1 Cookie的使用
          为确保网站正常运转，我们会在您的计算机或移动设备上存储名为Cookie的小数据文件。Cookie通常包含标识符、站点名称以及一些号码和字符。借助于Cookie，网站能够存储您的偏好等数据。
          
          2.2 Cookie同类技术的使用
          除Cookie外，我们还会在网站上使用网站信标和像素标签等其他同类技术。例如，我们向您发送的电子邮件可能含有链接至我们网站内容的点击URL，如果您点击该链接，我们则会跟踪此次点击，帮助我们了解您的产品或服务偏好。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">三、我们如何共享、转让、公开披露您的个人信息</text>
        <text class="section-content">
          3.1 共享
          我们不会向其他任何公司、组织和个人分享您的个人信息，但以下情况除外：
          - 在获取明确同意的情况下分享：获得您的明确同意后，我们会与其他方共享您的个人信息。
          - 我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。
          
          3.2 转让
          我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：
          - 在获取明确同意的情况下转让：获得您的明确同意后，我们会向其他方转让您的个人信息。
          - 在涉及合并、收购或破产清算时，如涉及到个人信息转让，我们会在要求新的持有您个人信息的公司、组织继续受此隐私政策的约束，否则我们将要求该公司、组织重新向您征求授权同意。
          
          3.3 公开披露
          我们仅会在以下情况下，公开披露您的个人信息：
          - 获得您明确同意后；
          - 基于法律的披露：在法律、法律程序、诉讼或政府主管部门强制性要求的情况下，我们可能会公开披露您的个人信息。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">四、我们如何保护您的个人信息</text>
        <text class="section-content">
          4.1 我们已使用符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失。
          
          4.2 我们会采取一切合理可行的措施，确保未收集无关的个人信息。
          
          4.3 我们承诺将使您的个人信息存储时间始终处于法律要求或实现产品功能所必需的最短期限内。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">五、您的权利</text>
        <text class="section-content">
          按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利：
          
          5.1 访问您的个人信息
          您有权访问您的个人信息，法律法规规定的例外情况除外。
          
          5.2 更正您的个人信息
          当您发现我们处理的关于您的个人信息有错误时，您有权要求我们做出更正。
          
          5.3 删除您的个人信息
          在以下情形中，您可以向我们提出删除个人信息的请求：
          - 如果我们处理个人信息的行为违反法律法规；
          - 如果我们收集、使用您的个人信息，却未征得您的同意；
          - 如果我们处理个人信息的行为违反了与您的约定；
          - 如果您不再使用我们的产品或服务，或您注销了账号；
          - 如果我们不再为您提供产品或服务。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">六、未成年人的个人信息保护</text>
        <text class="section-content">
          我们非常重视对未成年人个人信息的保护。如果您是18周岁以下的未成年人，在使用我们的产品或服务前，应事先取得您家长或法定监护人的同意。如您是未成年人的监护人，当您对您所监护的未成年人的个人信息处理存在疑问时，请通过本隐私政策公布的联系方式与我们联系。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">七、隐私政策的更新</text>
        <text class="section-content">
          我们可能适时更新本隐私政策的条款，该等更新构成本隐私政策的一部分。如该等更新造成您在本隐私政策下权利的实质减少，我们将在更新生效前通过在主页上显著位置提示或向您发送电子邮件或以其他方式通知您，在该种情况下，若您继续使用我们的服务，即表示同意受经修订的本隐私政策的约束。
        </text>
      </view>
      
      <view class="section">
        <text class="section-title">八、如何联系我们</text>
        <text class="section-content">
          如果您对本隐私政策有任何疑问、意见或建议，通过以下方式与我们联系：
          
          邮箱：privacy@HealthCoast.com
          电话：400-123-4567
          
          一般情况下，我们将在15天内回复。
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
    title: '隐私政策'
  });
});
</script>

<style scoped>
.privacy-container {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.privacy-content {
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
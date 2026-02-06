<template>
  <Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
    <template #left>
      <view class="header-left">
        <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
        <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
      </view>
    </template>
    <text class="header-title">{{ headerTitle }}</text>
  </Header>

  <view class="comment-page" :class="{ 'is-follow-up': isFollowUp }">
    <!-- 商品追评 -->
    <template v-if="isFollowUp">
      <view v-for="item of productList" :key="item.unique" class="follow-card">
        <view class="follow-card_product">
          <image :src="item.productImage" mode="aspectFill" class="follow-card_product_image" />
          <view class="follow-card_product_info">
            <view class="follow-card_product_info_name">
              {{ item.productName }}
            </view>
  
            <!-- <view v-if="!isFollowUp" class="follow-card_product_info_subtitle">
              {{ item.productTitle || '-' }}
            </view> -->
            <view class="follow-card_product_info_score">
              <uv-rate :modelValue="item.commentData?.productScore" readonly :count="5" :size="12" :gutter="0" active-color="#FF9D18"
                inactive-color="#E4E4E4" active-icon="star-fill" inactive-icon="star-fill" />
                
              <text class="follow-card_product_info_score_text">
                使用{{ item.commentData?.nextDay == 0 ? '当天' : `${item.commentData?.nextDay}天后` }}评价
              </text>
            </view>
          </view>
        </view>
        <view class="follow-card_review">
          <view class="follow-card_review_content">
            {{ item.commentData?.comment }}
          </view>
  
          <view v-if="getImgList(item.commentData?.pics).length > 0" class="follow-card_review_images">
            <image v-for="(img, imgIndex) in getImgList(item.commentData?.pics)" :key="imgIndex" :src="img"
              mode="aspectFill" class="follow-card_review_image"
              @click="previewImage(img, getImgList(item.commentData?.pics))" />
          </view>
        </view>
  
        <uv-line color="#E8E8E8" />
  
        <view class="follow-card_review_followup">
          发表追评
        </view>
  
        <view class="follow-card_review_input">
          <uv-textarea 
            border="none" 
            customStyle="background-color: #F2F3F5; border: 0;padding: 0;margin-bottom: 10rpx;"
            textStyle="color: #222222;"
            v-model="item.comment" placeholder="输入评论内容">
          </uv-textarea>
          <uv-upload 
            :fileList="item.fileList"
            name="1" multiple
            :maxCount="5"
            width="136rpx"
            height="136rpx"
            @afterRead="(file) => afterRead(file, item)"
            @delete="(event) => handleDeletePic(event, item)">
            <view class="upload-btn">
                <uv-icon name="camera" size="50rpx" color="#C2C2C2"></uv-icon>
                <text>添加照片</text>
              </view>
          </uv-upload>
        </view>

        <view class="follow-card_review_tip">
          提示: 您的评论内容在商品评论页面将会被匿名展示
        </view>
      </view>
    </template>
    
    <!-- 商品评价 -->
    <template v-else>
      <view v-for="item in productList" class="comment-card">
        <view class="comment-card_product">
          <image :src="item.productImage" mode="aspectFill" class="comment-card_product_image" />
          <view class="comment-card_product_info">
            <view class="comment-card_product_info_name">
              {{ item.productName }}
            </view>
            <view class="comment-card_product_info_subtitle">
              {{ item.productTitle || '-' }}
            </view>
          </view>
        </view>

        <view class="comment-card_score">
          <text class="comment-card_score_title">综合评价</text>
          <uv-rate v-model="item.productScore" :count="5" :readonly="isFollowUp" :size="21" :gutter="0" active-color="#FF9D18"
            inactive-color="#E4E4E4" active-icon="star-fill" inactive-icon="star-fill" />
          <text class="comment-card_score_text">
            {{ getCommentByScore(item.productScore) }}
          </text>
        </view>

        <view class="split-line"></view>

        <view class="comment-card_input_wrapper">
          <view class="comment-card_input">
            <uv-textarea 
              border="none" 
              customStyle="background-color: #F2F3F5; border: 0;padding: 0;margin-bottom: 10rpx; color: #222222;"
              textStyle="color: #222222;"
              v-model="item.comment" placeholder="输入评论内容">
            </uv-textarea>
            <uv-upload 
              :fileList="item.fileList"
              name="1" 
              multiple 
              width="136rpx"
              height="136rpx"
              :maxCount="5"
              @afterRead="(file) => afterRead(file, item)" @delete="(event) => handleDeletePic(event, item)">
              
              <view class="upload-btn">
                <uv-icon name="camera" size="50rpx" color="#C2C2C2"></uv-icon>
                <text>添加照片</text>
              </view>
            </uv-upload>
          </view>
          <view class="comment-card_input_tip">
            提示: 您的评论内容在商品评论页面将会被匿名展示
          </view>
        </view>
      </view>
    </template>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" :disabled="disableSubmit" @click="handleOrderComments">
        提交
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderComments, getOrderComments, orderFollowUpComment } from '@/api/order'
import { COMMON_IMG_PATH } from '@/utils/imgpath'
import { VUE_APP_UPLOAD_URL } from '@/config'
import { useRouter } from "@/hooks/useRouter"
import Header from "@/components/Header/index.vue";
import { pick } from 'lodash-es'

const { getUrlParams, goBack, toHome } = useRouter()

const productList = ref([{
  comment: '',
  pics: '',
  productScore: 5,
  serviceScore: 5,
  unique: '',
  prodcutName: '',
  imgs: [],
  fileList: [],
  productName: '',
  productTitle: '',
  productImage: '',
}])

// 保存orderId
const orderId = ref('')
const isFollowUp = ref(false)

const headerTitle = computed(() => {
  return isFollowUp.value ? '商品追评' : '商品评价'
})

// 根据评分返回评语
const getCommentByScore = (score) => {
  const scoreMap = {
    1: '非常不满意，商品质量很差',
    2: '不太满意，有待改进',
    3: '一般般，还可以',
    4: '比较满意，商品不错',
    5: '非常满意，值得推荐~'
  }
  // 处理半星评分，向下取整
  const roundedScore = Math.floor(score)
  return scoreMap[roundedScore] || scoreMap[5]
}

// 计算是否禁用提交按钮
const disableSubmit = computed(() => {
  return productList.value.some(product => !product.comment || product.comment?.trim().length === 0)
})

// 处理图片删除
const handleDeletePic = (event, item) => {
  console.log('handleDeletePic', event, item);
  item.imgs.splice(event.index, 1)
  item.fileList.splice(event.index, 1)
}

// 处理图片上传
const afterRead = async (event, item) => {
  // 当设置 multiple 为 true 时, file 为数组格式，否则为对象格式
  let lists = [].concat(event.file)
  let fileListLen = item.fileList.length
  lists.map((fileItem) => {
    item.fileList.push({
      ...fileItem,
      status: 'uploading',
      message: '上传中'
    })
  })
  for (let i = 0; i < lists.length; i++) {
    const result = await uploadFilePromise(lists[i].url)
    let itemData = item.fileList[fileListLen]
    let url = JSON.parse(result)

    item.fileList.splice(fileListLen, 1, Object.assign(itemData, {
      status: 'success',
      message: '',
      url: url.data
    }))
    item.imgs.push(url.data)
    fileListLen++
  }

  console.log('item.fileList', item.fileList);
}

// 上传文件Promise
const uploadFilePromise = (url) => {
  return new Promise((resolve, reject) => {
    let a = uni.uploadFile({
      url: VUE_APP_UPLOAD_URL,
      filePath: url,
      name: 'file',
      formData: {
        user: 'test'
      },
      success: (res) => {
        setTimeout(() => {
          resolve(res.data)
        }, 1000)
      }
    });
  })
}

// 提交评价
const handleOrderComments = async () => {
  if (disableSubmit.value) {
    uni.showToast({
      title: '请输入评价内容',
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: '处理中...',
    mask: true
  })
  
  try {
    productList.value.forEach(product => {
      product.pics = product.imgs.toString();
    });

    let res;
    if (isFollowUp.value) {

      if (productList.value?.some(item => !item.comment)) {
        console.log('请输入追评内容');
        uni.showToast({
          title: '请输入追评内容',
          icon: 'none'
        })
        return
      }

      const params = productList.value?.map(item => {
        return {
          productId: item.productId,
          additionalReply: item.comment,
          additionalReplyImage: item.pics,
          replyId: item.commentData?.id,
          additionalDay: 1
        }
      })

      console.log('提交追评的数据:', params);
      res = await orderFollowUpComment(params);
      console.log('提交追评的响应:', res, typeof res);
    } else {
      console.log('提交评价的数据:', JSON.stringify(productList.value));
      const params = productList.value?.map(item =>
        pick(item,
          ['comment', 'pics', 'productScore', 'serviceScore', 'unique'])
      )
      res = await orderComments(params);
      console.log('提交评价的响应:', res, typeof res);
    }

    if (res !== undefined && res !== null) {
      console.log('评价提交成功，显示成功提示');
      uni.showToast({
        title: isFollowUp.value ? "追评成功" : "评价成功",
        icon: "success",
        duration: 2000
      });

      setTimeout(() => {
        goBack()
      }, 1000);
    } else {
      console.log('评价提交失败，响应为空');

      uni.showToast({
        title: isFollowUp.value ? "追评失败，请重试" : "评价失败，请重试",
        icon: "none",
        duration: 2000
      });
    }
  } catch (error) {
    console.error('评价提交出错:', error);
    uni.showToast({
      title: isFollowUp.value ? "追评失败，请重试" : "评价失败，请重试",
      icon: "none",
      duration: 2000
    });
  } finally {
    uni.hideLoading();
  }
}

const previewImage = (img, imgs) => {
  uni.previewImage({
    urls: imgs,
    current: img
  })
}

const getImgList = (pics) => {
  if (!pics) return []

  return pics.split(',').filter(pic => pic && pic.trim() !== '');
}


// 页面加载
onLoad(async () => {
  const params = getUrlParams()
  console.log('页面加载时的参数:', params)

  // 保存orderId
  orderId.value = params.orderId || '';
  console.log('保存的orderId:', orderId.value);
  isFollowUp.value = !!params.followup;
  const oId = params.oId || '';

  // 处理商品列表数据，确保参数名称一致
  if (params.unique && Array.isArray(params.unique) && params.unique.length > 0) {
    let orderCommentsData = []
    if (isFollowUp.value) {
      if (!oId) {
        console.log('订单ID不存在', oId)
        uni.showToast({
          title: '订单ID不存在',
          icon: 'none'
        })
        goBack()
        return
      }

      orderCommentsData = await getOrderComments(oId) ?? [];
      console.log('获取订单评论数据:', orderCommentsData)
    }

    productList.value = params.unique.map(item => ({
      productId: item.productId,
      comment: '',
      pics: '',
      productScore: 5,
      serviceScore: 5,
      unique: item.unique,
      productName: item.productInfo?.storeName || item.product_name || '',
      productTitle: item.productInfo?.productTitle || '',
      productImage: item.productInfo?.image || '',
      imgs: [],
      fileList: [],
      commentData: orderCommentsData.find(commentItem => commentItem.productId === item.productId)
    }))
  }

})
console.log('商品列表数据:', productList.value);
</script>

<style lang="scss" scoped>
.comment-page {
  min-height: 100vh;
  padding: 0;
  box-sizing: border-box;
  background-color: #F8F9FA;

  &.is-follow-up {
    padding: 30rpx;
  }

  .follow-card {
    padding: 28rpx 22rpx;
    background: #FFFFFF;
    border-radius: 18rpx;
    box-sizing: border-box;

    &:not(:last-child) {
      margin-bottom: 24rpx;
    }

    .follow-card_product {
      @include useFlex(flex-start, center, row, nowrap, 18rpx);

      .follow-card_product_image {
        width: 115rpx;
        height: 115rpx;
      }

      .follow-card_product_info {

        .follow-card_product_info_name {
          font-weight: bold;
          font-size: 28rpx;
          color: #000000;
          line-height: 36rpx;
        }

        .follow-card_product_info_score {
          @include flex-align(flex-start, center);

          .follow-card_product_info_score_text {
            font-size: 20rpx;
            color: #7B7B7B;
            margin-left: 12rpx;
          }
        }
      }
    }

    .follow-card_review {
      margin-top: 20rpx;

      .follow-card_review_content {
        margin-bottom: 20rpx;
        font-size: 26rpx;
        color: #222222;
        line-height: 34rpx;
      }

      .follow-card_review_images {
        @include useFlex(flex-start, center, row, wrap, 29rpx);
        margin-bottom: 20rpx;

        .follow-card_review_image {
          width: 135rpx;
          height: 135rpx;
          border-radius: 12rpx;
        }
      }
    }

    .follow-card_review_followup {
      margin-top: 30rpx;
      font-weight: bold;
      font-size: 28rpx;
      color: #000000;
      line-height: 36rpx;
    }

    .follow-card_review_input {
      margin-top: 30rpx;
      padding: 20rpx;
      background-color: #F2F3F5;
      border-radius: 18rpx;
    }

    .follow-card_review_tip {
      margin-top: 29rpx;
      font-size: 22rpx;
      color: #999999;
      line-height: 32rpx;
    }
  }

  .comment-card {
    margin-bottom: 34rpx;
    background: #FFFFFF;
    box-sizing: border-box;

    .comment-card_product {
      @include useFlex(flex-start, center, row, nowrap, 18rpx);
      padding: 30rpx 50rpx;

      .comment-card_product_image {
        width: 104rpx;
        height: 104rpx;
      }

      .comment-card_product_info {
        .comment-card_product_info_name {
          font-weight: 600;
          font-size: 30rpx;
          color: #000000;
          line-height: 36rpx;
        }

        .comment-card_product_info_subtitle {
          font-weight: 400;
          font-size: 24rpx;
          color: #929292;
        }
      }
    }

    .comment-card_score {
      @include flex-align(flex-start, center);
      padding: 0 50rpx 30rpx;
  
      .comment-card_score_title {
        margin-right: 28rpx;
        font-weight: 600;
        font-size: 28rpx;
        color: #000000;
        line-height: 36rpx;
        white-space: nowrap;
      }
  
      .comment-card_score_text {
        margin-left: 18rpx;
        font-weight: 400;
        font-size: 24rpx;
        color: #EA472C;
        line-height: 36rpx;
      }
    }
  
    .split-line {
      height: 34rpx;
      background-color: #F8F9FA;
    }
  
    .comment-card_input_wrapper {
      padding: 40rpx;
  
      .comment-card_input {
        background-color: #F2F3F5;
        border-radius: 18rpx;
        padding: 20rpx;
      }

      .comment-card_input_tip {
        margin-top: 12rpx;
        font-size: 22rpx;
        color: #999999;
        line-height: 32rpx;
      }
    }
  }

  .upload-btn {
    @include useFlex(center, center, column, nowrap, 10rpx);
    height: 136rpx;
    width: 136rpx;
    background-color: #F2F3F5;
    border: 1rpx dotted #C2C2C2;
    border-radius: 12rpx;

    text {
      font-size: 22rpx;
      color: #999999;
      line-height: 28rpx;
    }
  }
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 64rpx;
  box-sizing: border-box;

  .submit-btn {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 64rpx;
    background-color: #00CBCC;
    color: #FFFFFF;
    font-family: 'MiSans';
    font-size: 28rpx;
    line-height: 64rpx;
    font-weight: 500;
    border: none;
    border-radius: 64rpx;
    letter-spacing: 3%;

    &::after {
      border: none;
    }
  }

  .submit-btn[disabled] {
    background-color: #CCCCCC;
    color: #999999;
    box-shadow: none;
  }
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #121212;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;

  .icon-home {
    width: 48rpx;
    height: 48rpx;
  }
}

// 适配小程序
@media screen and (max-width: 768px) {
  .comment-page {
    .submit-section {
      padding-bottom: calc(32rpx + env(safe-area-inset-bottom, 0));
    }
  }
}

</style>

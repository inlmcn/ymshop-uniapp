<template>
    <layout class="literature">
        <Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
            <template #left>
                <view class="header-left">
                    <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
                    <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
                </view>
            </template>
            <text class="header-title">科学循证</text>
        </Header>

        <view class="linerature-search">
            <!-- 搜索容器 -->
            <view class="search-container" :style="{
                backgroundImage: `url(${HOME_IMG_PATH}li-head.png), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover'
            }">
                <view class="title-container">
                    <text class="main-title">营养补充剂成分</text>
                    <text class="main-title">论文查询</text>
                </view>
                <view class="subtitle-container">
                    <text class="sub-title">由 HealthCoast营养严选 收录</text>
                </view>
                <view class="search-input-container">
                    <uv-input placeholder="搜索关键词" color="#ffffff" v-model="keyword" @confirm="handleSearch"
                        prefixIcon="search" border="surround" shape="circle" inputAlign="left"
                        class="custom-search-input" :customStyle="{
                            borderColor: '#939393',
                            borderWidth: '2rpx',
                            backgroundColor: 'transparent'
                        }" prefixIconStyle="color:#CACACA;font-size: 25px;">
                    </uv-input>
                </view>
            </view>

            <!-- 筛选区域 -->
            <view class="filter-wrapper">
                <view class="filter-container" ref="filterContainer" @click="toggleFilter">
                    <view class="filter-content">
                        <text class="filter-text" v-if="relSelectTags.length === 0">
                            全部结果
                        </text>
                        <text class="filter-text" v-else>
                            查询结果：共<text class="filter-count" style="color: #00CBCC;">
                                {{ total }}
                            </text>个相关结果
                        </text>
                    </view>
                    <view class="filter-dropdown">
                        <text :class="['filter-icon-text', { 'active': hasActiveFilter }]">筛选</text>
                        <image :src="hasActiveFilter ? HOME_IMG_PATH + 'Vector4.png' : HOME_IMG_PATH + 'Vector (1).png'"
                            class="filter-icon-img">
                        </image>
                    </view>
                </view>
            </view>
            <view style="position: relative;top: -2rpx;width: 100%;">
                <!-- 自定义筛选弹窗 -->
                <view class="custom-filter-mask" :class="{ show: showFilterPopup }" @click="closeFilterPopup"></view>
                <view class="custom-filter-popup" :class="{ show: showFilterPopup }">
                    <view class="filter-popup-content">
                        <view class="filter-popup-content-selct">
                            <!-- 健康目标 -->
                            <view class="filter-section">
                                <view class="filter-section-header">
                                    <text class="section-title">健康目标</text>
                                    <view class="section-more" @click="toggleMoreHealthTags">
                                        <text>{{ showAllHealthTags ? '收起' : '更多' }}</text>
                                        <uv-icon v-if="showAllHealthTags" name="arrow-up" size="12"
                                            color="#929292"></uv-icon>
                                        <uv-icon v-else name="arrow-down" size="12" color="#929292"></uv-icon>
                                    </view>
                                </view>
                                <view class="filter-tags-container">
                                    <view v-for="tag in visibleHealthTags" :key="tag.value" class="filter-tag"
                                        :class="{ active: tempSelectedHealthTags.includes(tag.value) }"
                                        @click="toggleHealthTag(tag.value)">
                                        {{ truncateText(tag.label) }}
                                        <image v-if="tempSelectedHealthTags.includes(tag.value)"
                                            :src="HOME_IMG_PATH + 'Frame 2119904144.png'" class="filter-marker">
                                        </image>
                                    </view>
                                </view>
                            </view>

                            <!-- 产品 -->
                            <view class="filter-section">
                                <view class="filter-section-header">
                                    <text class="section-title">产品</text>
                                    <view class="section-more" @click="toggleMoreProductTags">
                                        <text>{{ showAllProductTags ? '收起' : '更多' }}</text>
                                        <uv-icon v-if="showAllProductTags" name="arrow-up" size="12"
                                            color="#929292"></uv-icon>
                                        <uv-icon v-else name="arrow-down" size="12" color="#929292"></uv-icon>
                                    </view>
                                </view>
                                <view class="filter-tags-container-p">
                                    <view v-for="tag in visibleProductTags" :key="tag.value" class="filter-tag"
                                        :class="{ active: tempSelectedProductTags.includes(tag.value) }"
                                        @click="toggleProductTag(tag.value)">
                                        <image v-if="tag.image" :src="tag.image" class="filter-tag-image"></image>
                                        {{ truncateText(tag.label, 10) }}
                                        <image v-if="tempSelectedProductTags.includes(tag.value)"
                                            :src="HOME_IMG_PATH + 'Frame 2119904144.png'" class="filter-marker">
                                        </image>
                                    </view>
                                </view>
                            </view>
                        </view>

                        <!-- 操作按钮 -->
                        <view class="filter-actions">
                            <view class="reset-btn" @click="resetFilters">
                                <text>重置</text>
                            </view>
                            <view class="confirm-btn" @click="applyFilters">
                                <text>确认</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 文献列表 -->
            <view class="literature-list">
                <view v-for="item in paginatedList" :key="item.id" class="literature-item">
                    <!-- 第一行：标签和日期 -->
                    <view class="literature-header">
                        <scroll-view class="tags-container" scroll-x>
                            <view class="literature-tags">
                                <view v-for="(tag, index) in item.tags" :key="index" class="tag"
                                    :style="{ backgroundColor: tag.color || getDefaultTagColor(index) }">
                                    {{ tag.name || tag }}
                                </view>
                            </view>
                        </scroll-view>
                        <text class="date">{{ item.date }}</text>
                    </view>

                    <!-- 标题 -->
                    <text class="literature-title">{{ item.title }}</text>

                    <!-- 文献描述标题 -->
                    <text class="literature-message-title">文献描述</text>

                    <!-- 描述 -->
                    <view class="literature-description-wrapper">
                        <view class="description-container">
                            <text class="literature-description" :id="'desc-' + item.id">
                                <!-- 使用 computedDescription 而不是直接显示 -->
                                {{ computedDescriptions[item.id] || item.description }}
                            </text>

                            <view v-if="needsToggle.has(item.id)" class="expand-section">
                                <view class="line-clamp-indicator" v-if="!expandedItems.has(item.id)"></view>
                                <view class="expand-btn" @click.stop="toggleExpand(item.id)">
                                    <text class="expand-text">{{ expandedItems.has(item.id) ? '收起' : '展开' }}</text>
                                    <uv-icon v-if="expandedItems.has(item.id)" name="arrow-up" size="12"
                                        color="#000000"></uv-icon>
                                    <uv-icon v-else name="arrow-down" size="12" color="#000000"></uv-icon>
                                </view>
                            </view>
                        </view>
                    </view>

                    <!-- 底部 -->
                    <view class="literature-footer" v-if="item.doi" @click="openDOI(item.doi)">
                        <uv-icon name="attach" size="16" color="#A9A9A9"></uv-icon>
                        <text class="doi-link">{{ item.doi }}</text>
                    </view>
                </view>
            </view>

            <!-- 分页 -->
            <view class="pagination" v-if="!loading && total > 0">
                <text class="total-text">共 <text class="total-count">{{ total }}</text>
                    个结果</text>
                <uv-icon name="arrow-left" size="13" :color="currentPage === 1 ? '#C0C0C0' : '#222222'"
                    :class="{ disabled: currentPage === 1 }"
                    @click="currentPage !== 1 && handlePageChange(currentPage - 1)">
                </uv-icon>
                <text class="page-num">
                    <text class="current-page">{{ currentPage }}</text>
                    / {{ totalPages }}
                </text>
                <uv-icon name="arrow-right" size="13" :color="currentPage === totalPages ? '#C0C0C0' : '#222222'"
                    :class="{ disabled: currentPage === totalPages }"
                    @click="currentPage !== totalPages && handlePageChange(currentPage + 1)"></uv-icon>
            </view>
            <!-- 加载状态 -->
            <Empty v-if="!loading && paginatedList.length === 0" :iconSrc="emptyCollectIcon">
                这里空空如也~
            </Empty>
            <!-- 加载中 -->
            <ListLoadLoading v-if="loading" />
        </view>
    </layout>
</template>

<script setup>
import { COMMON_IMG_PATH, HOME_IMG_PATH } from '@/utils/imgpath.js'
import { useRouter } from '@/hooks/useRouter';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import Header from '@/components/Header/index.vue';
import { ref, onMounted, nextTick, computed, reactive } from 'vue';
import { getLiteratureList, getSelectList } from '@/api/literature';
import Empty from "@/components/Empty/index.vue"
import ListLoadLoading from "@/components/ListLoadLoading/index.vue"
import { emptyCollectIcon } from "@/utils/images";
import { getDictType } from "@/api/global";
import { useShare } from '@/hooks/useShare';

const { goBack, toHome, push } = useRouter();
const { commonPageShare } = useShare();

// 数据状态
const keyword = ref('');
const loading = ref(false);
const currentPage = ref(1);
const total = ref(0);
const expandedItems = ref(new Set());
const needsToggle = ref(new Set());
const computedDescriptions = reactive({});

// 筛选相关状态
const showFilterPopup = ref(false);
const showAllHealthTags = ref(false);
const showAllProductTags = ref(false);

// 筛选条件
const tempSelectedHealthTags = ref([])
const tempSelectedProductTags = ref([])
const selectedHealthTags = ref([]);
const selectedProductTags = ref([]);
const relSelectTags = ref([])

// 标签数据
const healthTags = ref([]);
const productTags = ref([]);

// 计算属性
const visibleHealthTags = computed(() => {
    return showAllHealthTags.value ? healthTags.value : healthTags.value.slice(0, 3);
});

const visibleProductTags = computed(() => {
    return showAllProductTags.value ? productTags.value : productTags.value.slice(0, 2);
});

const hasActiveFilter = computed(() => {
    return relSelectTags.value.length > 0
});

// 文献列表数据
const paginatedList = ref([]);

// 分页计算属性
const totalPages = computed(() => {
    return Math.ceil(total.value / 10);
});

// 默认标签颜色
const getDefaultTagColor = (index) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#3F51B5', '#00BCD4'];
    return colors[index % colors.length];
};

// 方法
const toggleFilter = async () => {
    showFilterPopup.value = !showFilterPopup.value;
    if (showFilterPopup.value) {
        // 弹窗打开时，将当前已确认的筛选条件复制到临时状态
        tempSelectedHealthTags.value = [...selectedHealthTags.value];
        tempSelectedProductTags.value = [...selectedProductTags.value];
    }
};

const closeFilterPopup = () => {
    showFilterPopup.value = false;
    // 关闭弹窗时恢复临时状态为已确认的状态
    tempSelectedHealthTags.value = [...selectedHealthTags.value];
    tempSelectedProductTags.value = [...selectedProductTags.value];
};


const openDOI = (doi) => {
    if (!doi) return;
    // 链接已复制
    uni.setClipboardData({
        data: doi,
        success: () => {
            uni.showToast({
                title: '链接已复制',
                icon: 'success',
                duration: 2000
            });
        }
    });
    // push({url: '/pages/webview/index'}, {data: {src: doi}})
};

const toggleMoreHealthTags = () => {
    showAllHealthTags.value = !showAllHealthTags.value;
};

const toggleMoreProductTags = () => {
    showAllProductTags.value = !showAllProductTags.value;
};

// 修改 toggleHealthTag 方法
const toggleHealthTag = (value) => {
    const index = tempSelectedHealthTags.value.indexOf(value);
    if (index > -1) {
        tempSelectedHealthTags.value.splice(index, 1);
    } else {
        tempSelectedHealthTags.value.push(value);
    }
};

const toggleProductTag = (value) => {
    const index = tempSelectedProductTags.value.indexOf(value);
    if (index > -1) {
        tempSelectedProductTags.value.splice(index, 1);
    } else {
        tempSelectedProductTags.value.push(value);
    }
};

const resetFilters = () => {
    // 只重置临时状态，不调用接口
    tempSelectedHealthTags.value = [];
    tempSelectedProductTags.value = [];
    showAllHealthTags.value = false;
    showAllProductTags.value = false;
};

const applyFilters = () => {
    showFilterPopup.value = false;
    currentPage.value = 1;
    
    // 将临时状态应用到实际筛选状态
    selectedHealthTags.value = [...tempSelectedHealthTags.value];
    selectedProductTags.value = [...tempSelectedProductTags.value];
    relSelectTags.value = [...selectedHealthTags.value, ...selectedProductTags.value];
    
    getAsyncList();

    nextTick(() => {
        setTimeout(() => {
            calculateTextNeedsToggle();
        }, 100);
    });
};

const handleSearch = () => {
    currentPage.value = 1;
    getAsyncList();

    nextTick(() => {
        setTimeout(() => {
            calculateTextNeedsToggle();
        }, 100);
    });
};


const toggleExpand = (id) => {
    if (expandedItems.value.has(id)) {
        expandedItems.value.delete(id);
    } else {
        expandedItems.value.add(id);
    }
    updateDescriptionText(id);
};

const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        uni.pageScrollTo({
            scrollTop: 0,
            duration: 300
        });

        getAsyncList();

        nextTick(() => {
            setTimeout(() => {
                calculateTextNeedsToggle();
            }, 100);
        });
    }
};

// 更新描述文本
const updateDescriptionText = (id) => {
    const item = paginatedList.value.find(item => item.id === id);
    if (!item) return;

    if (expandedItems.value.has(id)) {
        computedDescriptions[id] = item.description;
    } else {
        const query = uni.createSelectorQuery();
        query.select(`#desc-${id}`).boundingClientRect((rect) => {
            if (rect) {
                const charsPerLine = Math.floor(rect.width / 11);
                const maxChars = charsPerLine * 3;

                if (item.description.length > maxChars) {
                    computedDescriptions[id] = item.description.substring(0, maxChars - 3) + '...';
                } else {
                    computedDescriptions[id] = item.description;
                }
            }
        }).exec();
    }
};

// 计算文本是否需要展开/收起按钮
const calculateTextNeedsToggle = () => {
    nextTick(() => {
        setTimeout(() => {
            needsToggle.value.clear();

            const isMP = typeof uni !== 'undefined' && uni.getSystemInfoSync;

            if (isMP) {
                paginatedList.value.forEach(item => {
                    const query = uni.createSelectorQuery();
                    query.select(`#desc-${item.id}`).boundingClientRect((rect) => {
                        if (rect) {
                            const charsPerLine = Math.floor(rect.width / 11);
                            const maxChars = charsPerLine * 3;

                            if (item.description.length > maxChars) {
                                needsToggle.value.add(item.id);
                                if (!expandedItems.value.has(item.id)) {
                                    computedDescriptions[item.id] = item.description.substring(0, maxChars - 3) + '...';
                                } else {
                                    computedDescriptions[item.id] = item.description;
                                }
                            } else {
                                computedDescriptions[item.id] = item.description;
                            }
                        }
                    }).exec();
                });
            } else {
                paginatedList.value.forEach(item => {
                    const element = document.getElementById(`desc-${item.id}`);
                    if (element) {
                        const originalClass = element.className;
                        element.classList.remove('clamped');
                        const fullHeight = element.offsetHeight;
                        element.classList.add('clamped');
                        const clampedHeight = element.offsetHeight;
                        element.className = originalClass;

                        if (fullHeight > clampedHeight + 10) {
                            needsToggle.value.add(item.id);
                        }
                        computedDescriptions[item.id] = item.description;
                    }
                });
            }
        }, 300);
    });
};
const truncateText = (text, maxLength = 5) => {
    if (!text) return '';
    
    // 计算字符长度：中文算1，字母数字算0.5
    let totalLength = 0;
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // 判断字符类型
        if (/[\u4e00-\u9fa5]/.test(char)) {
            // 中文字符 - 算1个字符
            totalLength += 1;
        } else {
            // 所有非中文字符（字母、数字、符号等）- 都算0.5个字符
            totalLength += 0.5;
        }
        
        // 如果加上当前字符后超过了最大长度
        if (totalLength > maxLength) {
            // 如果当前字符是中文，就不能加了，直接加省略号
            if (/[\u4e00-\u9fa5]/.test(char)) {
                result += '...';
            } else {
                // 如果当前字符是英文/数字，检查是否能再容纳半个字符
                if (totalLength - 0.5 <= maxLength) {
                    result += char + '...';
                } else {
                    result += '...';
                }
            }
            break;
        } else {
            // 没超过最大长度，添加当前字符
            result += char;
            
            // 如果正好等于最大长度，直接结束（不再检查下一个字符）
            if (totalLength === maxLength) {
                // 如果刚好达到最大长度且后面还有字符，加省略号
                if (i < text.length - 1) {
                    result += '...';
                }
                break;
            }
        }
    }
    
    return result;
};

function formatDateToYearMonth(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // 验证日期有效性
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
}

// 获取文献列表数据
const getAsyncList = async () => {
    try {
        loading.value = true;
        const params = {
            pageNo: currentPage.value,
            pageSize: 10,
            name: keyword.value,
            healthTag: selectedHealthTags.value.join(','),
            productName: selectedProductTags.value.join(','),
        }
        // if(!keyword.value && selectedProductTags.value && selectedProductTags.value.length){
        //     params.name = selectedProductTags.value.join(',')
        // }else if(selectedProductTags.value && selectedProductTags.value.length){
        //     params.productName = selectedProductTags.value.join(',')
        // }
        const res = await getLiteratureList(params);

        if (res.list && res.list.length > 0) {
            // 映射后端数据结构到前端组件所需格式
            paginatedList.value = res.list.map(item => {
                // 从 itemList 中获取第一个条目作为主要信息源
                const mainItem = item.itemList && item.itemList.length > 0 ? item.itemList[0] : {};

                // 处理健康标签 (使用 itemList 中的 healthItemTag)
                let tags = [];
                try {
                    if (mainItem.healthItemTag) {
                        // 解析 JSON 格式的标签数据
                        const parsedTags = JSON.parse(mainItem.healthItemTag);
                        if (Array.isArray(parsedTags)) {
                            tags = parsedTags;
                        }
                    } else if (Array.isArray(item.healthTagList)) {
                        // 备用方案：使用 healthTagList
                        tags = item.healthTagList.map(tag => ({
                            name: tag,
                            color: getDefaultTagColor(Math.random() * 10)
                        }));
                    }
                } catch (e) {
                    console.warn('解析标签出错:', e);
                    // 如果解析失败，使用简单的字符串标签
                    tags = [{ name: '默认标签', color: '#9E9E9E' }];
                }

                return {
                    id: item.id,
                    title: mainItem.title || '',
                    description: mainItem.content ? mainItem.content.replace(/<[^>]+>/g, '') : '',
                    tags: tags,
                    date: item.jcTime ? formatDateToYearMonth(item.jcTime) : '',
                    doi: mainItem.originalLink || ''
                };
            });

            total.value = res.total || 0;
        } else {
            paginatedList.value = [];
            total.value = 0;
        }
    } catch (err) {
        console.error('获取文献列表失败:', err);
        uni.showToast({
            title: '数据加载失败',
            icon: 'none'
        });
        paginatedList.value = [];
        total.value = 0;
    } finally {
        loading.value = false;

        // 计算文本展开状态
        nextTick(() => {
            setTimeout(() => {
                calculateTextNeedsToggle();
            }, 100);
        });
    }
};

const getSelectLists = async () => {
    try {
        const res = await getSelectList();
        const restwo = await getDictType('ym_health_tag')
        if (restwo && Array.isArray(restwo) && restwo.length > 0) {
            healthTags.value = restwo.map(tag => ({
                label: tag.label,
                value: tag.label
            }));
        }

        if (res.productList && res.productList.length > 0) {
            const uniqueProducts = [...new Set(res.productList.map(product => product.name).filter(name => name))];
            productTags.value = uniqueProducts.map(name => {
                // 找到对应的产品信息，获取第一张图片
                const productInfo = res.productList.find(p => p.name === name);
                const image = productInfo && productInfo.productList && productInfo.productList.length > 0
                    ? productInfo.productList[0].image
                    : '';

                return {
                    label: name,
                    value: name,
                    image: image
                };
            });
        }
    } catch (err) {
        console.error('获取标签列表失败:', err);
    }
}

onShareAppMessage(() => {
    return commonPageShare();
});

onShareTimeline(() => {
    return commonPageShare();
});

onMounted(() => {
    getSelectLists();
    getAsyncList();
});
</script>

<style lang="scss" scoped>
// Header Section
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

// 搜索容器
.search-container {
    height: 300rpx;
    padding: 28rpx 33rpx;
    box-sizing: border-box;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 5;

    .title-container {
        display: flex;
        flex-direction: column;
        align-items: center;

        .main-title {
            font-weight: 600;
            font-size: 50rpx;
            color: #FFFFFF;
            line-height: 55rpx;
            text-align: center;
            font-style: normal;
            text-transform: none;
        }
    }

    .subtitle-container {
        margin-top: 9rpx;
        position: relative;

        .sub-title {
            font-weight: 400;
            font-size: 22rpx;
            line-height: 1;
            color: #FFFFFF;
            text-align: center;
            font-style: normal;
            text-transform: none;
        }

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 200rpx;
            height: 2rpx;
            background-color: #FFFFFF;
        }
    }

    .search-input-container {
        width: 100%;
        margin-top: 16rpx;
    }
}

.linerature-search {
    width: 100%;
    min-height: 100vh;
    background: $uni-bg-color;
    position: relative;
    padding-bottom: 80rpx;
    overflow-x: hidden;
    box-sizing: border-box;
}

// 筛选区域
.filter-wrapper {
    padding: 40rpx 32rpx 2rpx;
    position: relative;
    z-index: 5;
    background-color: #fff;
}

.filter-container {
    height: 64rpx;
    background: #F7F7F7;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    cursor: pointer;
    position: relative;
    z-index: 10;
}

.filter-content {
    flex: 1;

    .filter-text {
        font-weight: 400;
        font-size: 28rpx;
        color: #666666;
        line-height: 28rpx;
    }
}

.filter-dropdown {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .filter-icon-text {
        font-weight: 400;
        font-size: 28rpx;
        color: #333333;
        line-height: 28rpx;
    }

    .filter-icon-text.active {
        color: #00CBCC;
    }

    .filter-icon-img {
        width: 16rpx;
        height: 18rpx;
        margin-top: 2rpx;
        margin-left: 2rpx;
    }
}

.filter-count {
    color: #00CBCC;
}

.filter-marker {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 31rpx;
    height: 28rpx;
}

// 自定义筛选弹窗遮罩
.custom-filter-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 4;
    pointer-events: auto;

    // 添加动画效果
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

// 当遮罩显示时的样式
.custom-filter-mask.show {
    opacity: 1;
    visibility: visible;
}

// 自定义筛选弹窗
.custom-filter-popup {
    width: 100%;
    position: absolute;
    z-index: 6;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-20rpx);
    transition: all 0.1s ease;

    &.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
}

.filter-popup-content {
    background: #ffffff;
    border-radius: 0 0 20rpx 20rpx;
    padding: 32rpx;
    width: 100%;
    box-sizing: border-box;
}

.filter-section {
    margin-bottom: 32rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.filter-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 34rpx;

    .section-title {
        font-weight: 600;
        font-size: 28rpx;
        color: #333333;
        line-height: 28rpx;
    }

    .section-more {
        display: flex;
        align-items: center;
        gap: 8rpx;
        cursor: pointer;

        text {
            font-weight: 400;
            font-size: 22rpx;
            color: #929292;
            line-height: 22rpx;
        }
    }
}

.filter-tags-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx 32rpx; // 行间距20rpx，列间距32rpx
    transition: all 0.3s ease-out;
}
.filter-tags-container-p {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx 32rpx; // 行间距20rpx，列间距32rpx
    transition: all 0.3s ease-out;
}

.filter-tag {
    position: relative;
    height: 56rpx;
    // padding: 0 24rpx;
    border-radius: 8rpx;
    border: 1rpx solid #B3B3B3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 24rpx;
    color: #000000;
    cursor: pointer;
    transition: all 0.3s;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.active {
        border-color: #00CBCC;
        color: #00CBCC;
    }
}

.filter-tag-image {
    width: 24rpx;
    height: 26rpx;
    margin-right: 3rpx;
}

.filter-actions {
    height: 110rpx;
    background: #FFFFFF;
    box-shadow: 0rpx -3rpx 16rpx 0rpx rgba(0, 0, 0, 0.07);
    border-radius: 0rpx 0rpx 20rpx 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    margin: 40rpx -32rpx -32rpx -32rpx;

    .reset-btn,
    .confirm-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .reset-btn {
        width: 200rpx;
        height: 64rpx;
        border-radius: 106rpx;
        border: 1rpx solid #B3B3B3;
        font-weight: 400;
        font-size: 28rpx;
        color: #000000;
    }

    .confirm-btn {
        width: 200rpx;
        height: 64rpx;
        background: #00CBCC;
        border-radius: 57rpx;
        font-weight: 400;
        font-size: 28rpx;
        color: #FFFFFF;
    }
}

// 文献列表
.literature-list {
    padding: 54rpx 32rpx 32rpx;
}

.literature-item {
    background: #FFFFFF;
    border-radius: 20rpx;
    border: 2rpx solid #F0F0F0;
    padding: 38rpx 47rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.literature-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tags-container {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
}

.literature-tags {
    display: inline-block;
}

.tag {
    display: inline-flex;  /* 使用 flex 布局，更好的居中控制 */
    align-items: center;    /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    padding: 0 24rpx;
    border-radius: 45rpx;
    font-weight: 400;
    font-size: 26rpx;
    color: #FFFFFF;
    height: 48rpx;
    min-height: 48rpx;  /* 添加最小高度，防止内容太少时高度不一致 */
    margin-right: 10rpx;
    box-sizing: border-box;
    white-space: nowrap;
    vertical-align: middle;  /* 确保多个标签对齐 */
}


.tag.success {
    background-color: #4CAF50;
}

.tag.primary {
    background-color: #2196F3;
}

.tag.warning {
    background-color: #FF9800;
}

.tag.info {
    background-color: #2196F3;
}

.tag.danger {
    background-color: #F44336;
}

.date {
    font-weight: 400;
    font-size: 26rpx;
    color: #000000;
    line-height: 17rpx;
    flex-shrink: 0;
    margin-left: 20rpx;
}

.literature-title {
    padding: 28rpx 0;
    font-weight: 500;
    font-size: 38rpx;
    color: #000000;
    line-height: 52rpx;
    border-bottom: 1rpx solid #D0D0D0;
    display: block;
    margin-bottom: 20rpx;
}

.literature-message-title {
    font-weight: 400;
    font-size: 34rpx;
    color: #000000;
    line-height: 52rpx;
    margin: 25rpx 0 13rpx 0;
    display: block;
}

.literature-description-wrapper {
    position: relative;
    margin-bottom: 15rpx;
}

.description-container {
    position: relative;
}

.literature-description {
    font-weight: 400;
    font-size: 22rpx;
    color: #000000;
    line-height: 43rpx;
    transition: all 0.3s ease;
    word-break: break-word;
    display: block;
}

// 移除原来的clamped和expanded类，因为我们要用JS控制
.expand-section {
    position: absolute;
    right: 10rpx;
    bottom: 6rpx;
    z-index: 2;
}

.line-clamp-indicator {
    position: absolute;
    right: 80rpx;
    bottom: 0;
    background: linear-gradient(to right, transparent 0%, #ffffff 50%);
    width: 30rpx;
    height: 43rpx;
    z-index: 1;
}

.expand-btn {
    display: flex;
    align-items: baseline;
    font-weight: 400;
    font-size: 26rpx;
    color: #000000;
    cursor: pointer;
    background-color: #ffffff;
    padding-left: 10rpx;
    z-index: 2;
    position: relative;

    .expand-text {
        margin-right: 4rpx;
        text-decoration: underline;
    }
}

.arrow-icon {
    transition: transform 0.3s ease;
}

.arrow-icon.rotated {
    transform: rotate(180deg);
}

.literature-footer {
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 26rpx;
    color: #A9A9A9;
}

.doi-link {
    color: #A9A9A9;
    cursor: pointer;
    margin-left: 10rpx;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-weight: 500;
    font-size: 26rpx;
    color: #000000;
    line-height: 17rpx;
    gap: 20rpx;
    padding: 30rpx 0;
    margin-top: 20rpx;
}

.total-text {
    color: #000000;
    margin-right: 20rpx;
}

.total-count {
    color: #00CBCC;
}

.page-num {
    color: #000000;
}

.current-page {
    color: #00CBCC;
}

.page-nav.disabled {
    color: #C0C0C0;
    cursor: not-allowed;
}

.page-num {
    font-weight: 500;
}

.filter-popup-content-selct {
    background-color: #F7F7F7;
    padding: 32rpx;
    border-radius: 20rpx;
}


.custom-search-input ::v-deep .uv-input__input::placeholder {
    color: #CACACA !important;
    font-size: 27rpx !important;
    opacity: 1;
}

.custom-search-input ::v-deep input::placeholder {
    color: #CACACA !important;
    font-size: 27rpx !important;
}
</style>
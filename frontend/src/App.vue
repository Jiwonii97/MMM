<template>
  <header id="nav">
    <span class="menus">
      <router-link to="/" class="logo">
        <img id="logo-image" src="@/assets/logo.png"/>
      </router-link>
      <Search id="search-bar" @search="search"/>
      <span class="button-zone">
        <Btn v-if="userInfo['isLogined']" class="button" @click="logout" theme="primary">로그아웃</Btn>
        <Btn v-else class="button" @click="openLogin" theme="primary">로그인</Btn>
        <router-link class="button" to="/analysis">
          <Btn theme="white">AI 화장법 추천</Btn>
        </router-link>
      </span> 
    </span>
  </header>
  <main>
    <aside>
      <div class="guide">
        <Profile 
          class="profile"
          @openLogin="openLogin"
          @openUpload="openUpload"
        />
        <div v-if="userInfo['isLogined']" class="Recommend-channels">
          <h3>구독한 채널</h3>
          <hr/>
          <ChannelList path="/channelshort" :channelList="defaultChannels"/>
          <ChannelList path="/channelshort" :channelList="userInfo['subscribeChannelList']"/>
        </div>
        <div v-else class="Recommend-channels">
          <h3>추천 채널</h3>
          <hr/>
          <ChannelList path="/channelshort" :channelList="RecommendChannelList"/>
        </div>
        <div class="Recommend-tags">
          <h3>추천 태그</h3>
          <hr/>
          <div class="tag-list">
            <Tag 
              v-for="(value,index) in RecommendTagList" :key="index"
              :title="value"
            />
          </div>
        </div>
      </div>
    </aside>
    
    <article ref="article" @scroll="scrollHandler($event)">
      <router-view/>
    </article>
  </main>
  <BlurCard v-if="loginPageOn" @close="closeLogin">
    <LoginCard/>
  </BlurCard>
  <BlurCard v-if="uploadShortPageOn" @close="closeUpload">
      <ShortUpload/>
  </BlurCard>
  <Short 
    v-if="shortPageOn"
    @close="closeShort"
  />
</template>
<script>

import Btn from './components/Btn.vue'
import Profile from '@/components/Profile.vue'
import Search from '@/components/SearchBar.vue'
import Short from '@/components/widget/Short.vue'
import BlurCard from '@/components/BlurCard.vue'
import ChannelList from '@/components/ChannelList.vue'
import Tag from '@/components/Tag.vue'
import ShortUpload from '@/components/widget/ShortUpload.vue'
import LoginCard from '@/components/widget/LoginCard.vue'

import AllSubscribeImg from '@/assets/images/all-subscribe.png';
import {mapState,mapActions, mapMutations} from 'vuex'


export default {
  data() {
    return {
      uploadClicked:false,
      defaultChannels: [
        {
            title:'구독한 모든 채널',
            profile:AllSubscribeImg,
            channelId: 0
        }
      ],
      scrollHistory:false
    }
  },
  components: {
    Search,
    BlurCard,
    Short,
    Profile,
    ChannelList,
    Tag,
    ShortUpload,
    LoginCard,
    Btn
  },
  mounted() {
    this.getRecommendTags();
    this.getRecommendChannels();
  },
  computed: {
    ...mapState([
      'userInfo',
      'RecommendTagList',
      'RecommendChannelList',
      'currentShort',
      'currentChannel',
      'currentProduct',
      'loginPageOn',
      'uploadShortPageOn',
      'shortPageOn',
      'isPurchaseListLoading',
      'isRecommendShortLoading',
      'isDesc',
    ])
  },
  methods: {
    ...mapMutations([
      'setLoginPageOn',
      'setUploadShortPageOn',
      'setShortPageOn',
      'initPurchaseList'
    ]),
    ...mapActions([
      'requestLogout',
      'getRecommendTags',
      'getRecommendChannels',
      'requestSearch',
      'moreChannelSearch',
      'moreShortSearch',
      'moreProductSearch',
      'morePurchaseHistory',
      'moreShortRecommend',
      'moreChannelShorts',
      'moreReview'
    ]),
    closeLogin() {
      this.setLoginPageOn(false);
    },
    openLogin() {
      this.setLoginPageOn(true);
    },
    closeUpload() {
      this.setUploadShortPageOn(false);
    },
    openUpload() {
      this.setUploadShortPageOn(true);
    },
    closeShort() {
      this.setShortPageOn(false);
    },
    search(content) {
      this.requestSearch(content);
    },
    logout() {
      this.requestLogout();
      this.initPurchaseList();
    },
    scrollHandler(event) {
      const articleEl = this.$refs['article'];
      const scrollPosition = (event.target.scrollTop+articleEl.clientHeight)/300;
      const scrollEnd = (articleEl.scrollHeight/300).toFixed(0);
      if(scrollPosition.toFixed(0) === scrollEnd) {
        switch(this.$route.path) {
          case '/': {
            if(this.isRecommendShortLoading!=='end')
              this.moreShortRecommend(); break;
          }
          case '/channelshort': {
            this.moreChannelShorts(this.currentChannel.channelId); break; 
          }
          case '/channel': {
            this.moreChannelShorts(this.currentChannel.channelId); break; 
          }
          // case '/product': {
          //   this.moreReview({pid:this.currentProduct.productId, desc:this.isDesc}); break; 
          // }
          case '/search/channels': {
            //
            this.moreChannelSearch(this.$route.query['content']); break; 
          }
          case '/search/products': {
            this.moreProductSearch(this.$route.query['content']); break; 
          }
          case '/search/': {
            this.moreShortSearch(this.$route.query['content']); break; 
          }
          case '/mypage/purchase-history': {
            if(this.isPurchaseListLoading!=='end')
              this.morePurchaseHistory(); break; 
          }
        }
      }
    }
  },
}
</script>
<style lang="scss">
:root {
  --white-text-color: #FEFEFE;
  --placeholder-color: #CCCCCC;
  --placeholder-color-darken: #BBBBBB;
  --text-color:#000000;
  --background-color: #FEFEFE;
  --background-color-darken: #EEEEEE;
  --primary-color: #3D3D78;
  --primary-color-lighten:#494991;
  --primary-color-darken: #2c2c57;
  --error-color: #FF5252;
  --warning-color: #FB8C00;
  --info-color: #2196F3;
  --success-color: #4CAF50;
}
* {
  box-sizing:border-box;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 300;
}
body {
  padding:0;
  margin:0;
  width:100vw;
  height:100vh;
  overflow:hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position:absolute;
  height:100%;
  width:100%;
  color: #2c3e50;
}
h2 {
  font-weight:700;
}
b {
  font-weight:700;
}
header#nav {
  position:fixed;
  display:flex;
  flex-direction:row;
  justify-content: center;
  z-index:50;
  height:100px;
  width:100%;
  padding: 20px;
  border-bottom:1px solid #cccccc;
  .menus {
    position:relative;
    display:flex;
    flex-direction:row;
    justify-content: space-between;
    max-width:1210px;
    width:100%;
    height:60px;
    a.logo {
      margin:auto 0;
      height:60px;
      img {
        width:auto;
        height:60px;
      }
    }
    #search-bar {
      margin:auto 0;
      height:40px;
      width:400px;
    }
    .button-zone {
      margin:auto 0;
      height:40px;
      right:0;
      .button {
        position:relative;
        right:0;
        margin-right:10px;
      }
    }
  }
}
main {
  position:relative;
  margin-top:100px;
  display:flex;
  flex-grow:1;
  flex-direction:row;
  height:calc(100vh - 100px);
  aside {
    position:relative;
    flex-grow:2;
    overflow-y:scroll;
    overflow-x:hidden;
    background-color:var(--background-color);
    .guide {
      position:absolute;
      right:0;
      width:250px;
      padding-right:10px;
      padding-bottom:100px;
    }
  }
  article {
    padding-right:5px;
    position:relative;
    flex-grow:5;
    overflow-y:scroll;
    overflow-x:hidden;
    div.page {
      position:absolute;
      left:0;
      padding-left:40px;
      width:1020px;
      padding-bottom:200px;
    }
  }
}
button {
  cursor:pointer;
}
h3 {
  text-align:left;
}
hr {
  border:0;
  border-top:1px solid var(--placeholder-color);
  margin-bottom:20px;
}
p {
  margin:10px 0;
}
a {
  text-decoration:none;
  color:var(--primary-color);
}
a:hover {
  text-decoration:underline;
}
input {
  border-radius:4px;
  padding:10px;
  border: 2px solid var(--placeholder-color);
}
input:focus {
  transition:0.3s;
  outline:none;
  border: 2px solid var(--primary-color);
}
textarea {
  border-radius:4px;
  padding:10px;
  border:2px solid var(--placeholder-color);
  resize:none;
}
textarea:focus {
  transition:0.3s;
  outline:none;
  border:2px solid var(--primary-color);
    
}
.tag-list {
  display:flex;
  flex-direction:row;
  flex-wrap:wrap;
}
.profile {
  margin-top:40px;
}
aside::-webkit-scrollbar {
  background-color:white;
  width:12px;
}
aside::-webkit-scrollbar-thumb {
  background-color:white;
}
aside:hover::-webkit-scrollbar-thumb {
  background-color:var(--placeholder-color);
}
article::-webkit-scrollbar {
  background-color:white;
  width:12px;
}
article::-webkit-scrollbar-thumb {
  background-color:var(--placeholder-color);
}
.loading.icon {
  font-size:3rem;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

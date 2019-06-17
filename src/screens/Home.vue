<template>
  <div id="home">
    <div class="skin__bg-wrapper" v-if="systemConfig.theme!=='default-theme'">
      <div :class="`skin__bg skin__bg-${systemConfig.theme}`">
        <div :class="`skin__dots skin__dots-${systemConfig.theme}`"></div>
      </div>
    </div>

    <el-main v-if="isHome">
      <el-carousel indicator-position="inside" height="400px">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-img" :style="{backgroundImage: banner.image?`url(${banner.image})`:''}"></div>
        </el-carousel-item>
      </el-carousel>

      <marquee-text class="announcement-wrapper" v-if="announcements.length" :duration="announcements.length * 15">
        <template v-for="(txt, index) in announcementsWithoutHTML">
          <span class="text" @click="announcementDialogVisible = true"> {{index + 1}}. {{txt}} &nbsp;&nbsp;&nbsp;</span>
        </template>
      </marquee-text>

      <section class="activity-area" v-if="showActivityArea">
        <div class="activity-area-title">最新优惠</div>
        <div class="activities">
          <router-link to="/register" class="activity-register" v-if="user.account_type === undefined && systemConfig.regPresentAmount > 0">
            <div class="activity">
              <div class="activity-icon">
                <img src="../assets/red-envelope-v2/icon-1@2x.png" />
              </div>
              <div class="activity-info">
                <div class="activity-title">立即注册送彩金</div>
                <div class="activity-desc">注册立领 ¥{{ systemConfig.regPresentAmount }}</div>
              </div>
            </div>
          </router-link>
          <a href="#" @click.prevent="actDialogType = 'boost'" v-if="actBoostEnabled">
            <div class="activity">
              <div class="activity-icon">
                <img src="../assets/red-envelope-v2/icon-2@2x.png" />
              </div>
              <div class="activity-info">
                <div class="activity-title">返利红包大放送</div>
                <div class="activity-desc">天天拆红包</div>
              </div>
            </div>
          </a>
          <a href="#" @click.prevent="actDialogType = 'referral'" v-if="actReferralEnabled">
            <div class="activity">
              <div class="activity-icon">
                <img src="../assets/red-envelope-v2/icon-3@2x.png" />
              </div>
              <div class="activity-info">
                <div class="activity-title">推荐好友领红包</div>
                <div class="activity-desc">好友多红包多</div>
              </div>
            </div>
          </a>
        </div>
      </section>

      <section v-if="systemConfig.theme!=='default-theme'" class="skin__wrapper">
        <el-row  v-if="games.length" class="skin__gamearea-wrapper container">
          <div class="gamearea-title">
            <img class="fire-image" src="../assets/popular.png"/>
            <p class="text">热门游戏</p>
          </div>
          <div class="gamearea">
            <ul class="clearfix">
              <router-link :to="'/game/'" tag="li" class="list-item game-ad">
                <img class="icon" src="../assets/game-ad.png" alt="More Games"/>
                <p class="text">20 多款游戏，数百种创新玩法</p>
              </router-link>
              <li class="list-item game"
                v-for="game in games"
                :key="game.id"
                @click="navigate(game)">
                <div class="game-icon clickable">
                  <img class="img" :src="game.icon" :alt="game.display_name"/>
                  <p class="name">{{game.display_name}}</p>
                </div>
              </li>
              <router-link class="list-item" :to="'/game/'" tag="li">
                <div class="game-icon more">
                  <img class="img more-game" src="../assets/moregame.png" alt="More Games"/>
                  <p class="name">更多游戏 &raquo;</p>
                </div>
              </router-link>
            </ul>
          </div>
        </el-row>
        <el-row class="payments">
          <img class="img" src="../assets/payment.png"/>
        </el-row>
      </section>
      <template v-else>
        <section v-if="games.length">
          <div class="gamearea-title">
            <img class="fire-image" src="../assets/popular.png"/>
            <p class="text">热门游戏</p>
          </div>
          <el-row class="gamearea-wrapper container">
            <div class="gamearea">
              <ul class="clearfix">
                <router-link :to="'/game/'" tag="li" class="list-item game-ad">
                  <img class="icon" src="../assets/game-ad.png" alt="More Games"/>
                  <p class="text">20 多款游戏，数百种创新玩法</p>
                </router-link>
                <li class="list-item game"
                  v-for="game in games"
                  :key="game.id"
                  @click="navigate(game)">
                  <div class="game-icon">
                    <img class="img" :src="game.icon" :alt="game.display_name"/>
                    <p class="name">{{game.display_name}}</p>
                  </div>
                </li>
                <router-link class="list-item" :to="'/game/'" tag="li">
                  <div class="game-icon more">
                    <img class="img more-game" src="../assets/moregame.png" alt="More Games"/>
                    <p class="name">更多游戏 &raquo;</p>
                  </div>
                </router-link>
              </ul>
            </div>
          </el-row>
        </section>
        <el-row class="payments">
          <img class="img" src="../assets/payment.png"/>
        </el-row>
      </template>
      <el-row v-if="descriptions.length" class="ads container">
        <el-col
          v-for="(item, index) in descriptions"
          :key="index"
          class="ad"
          :offset="descriptions.length === 1? 6 : 0"
          :span="dynamicAdWidth"
          >
          <div class="ad-title">
            <img :src="item.header_image" :alt="item.id" />
          </div>
          <div :class="[`ad-content${descriptions.length}`]">
            <img :src="item.main_image" v-if="item.main_image" />
            <p class="content-text" v-if="item.main_description" v-html="formattedText(item.main_description)"></p>
          </div>
        </el-col>
      </el-row>
    </el-main>
    <el-main v-else>
      <router-view/>
    </el-main>
    <FloatAd v-if="systemConfig.floatAd && floatAdVisible" :content="systemConfig.floatAd" :floatAdVisible="floatAdVisible" @switchFloatAd="switchFloatAd"/>
    <el-dialog
      :title="$t('announcement.speaker')"
      :visible.sync="announcementDialogVisible"
      :width="'600px'"
      center
      append-to-body>
      <el-carousel :height="'200px'"
        class="announcement-popup"
        :initial-index="currentAnnouncementIndex">
        <el-carousel-item v-for="(announcement, index) in announcements" interval="5000"
          :key="index">
          <div class="wrapper">
            <div class="text-center" :style="{'line-height': 1.5}" key="announcement" v-html="announcement">
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
    <RedEnvPromotion :type="actDialogType" @hide="actDialogType = ''" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import MarqueeText from 'vue-marquee-text-component'
import 'vue-awesome/icons/bullhorn'
import FloatAd from '../components/FloatAd'
import { each } from 'lodash'
import RedEnvPromotion from '@/components/actV2/RedEnvPromotion'

export default {
  components: {
    FloatAd,
    MarqueeText,
    RedEnvPromotion
  },
  name: 'Home',
  data () {
    return {
      announcementWidth: 0,
      leftOffset: 0,
      announcementTimer: null,
      currentAnnouncementIndex: 0,
      announcementDialogVisible: false,
      floatAdVisible: false,
      actDialogType: ''
    }
  },
  computed: {
    ...mapState([
      'user', 'systemConfig', 'announcements', 'banners', 'descriptions'
    ]),
    ...mapState('actv2', {
      actBoostEnabled: state => state.boost.enabled,
      actReferralEnabled: state => state.referral.enabled
    }),
    ...mapGetters([
      'allGames'
    ]),
    games () {
      const games = []
      if (this.allGames && this.allGames.length) {
        each(this.allGames, (game, index) => {
          if (game.icon && index < 9) {
            games.push(game)
          }
        })
      }
      return games
    },
    isHome () {
      return this.$store.state.route.path === '/'
    },
    dynamicAdWidth () {
      let length = this.descriptions.length
      if (length === 1) {
        return 12
      } else {
        return 24 / length
      }
    },
    announcementsWithoutHTML () {
      return this.announcements.map(a => this.removeHTML(a))
    },
    showActivityArea () {
      return (this.user.account_type === undefined && this.systemConfig.regPresentAmount > 0) || this.actBoostEnabled || this.actReferralEnabled
    }
  },
  watch: {
    announcements: {
      immediate: true,
      handler (announcements) {
        if (announcements.length) {
          this.announcementDialogVisible = true
        }
      }
    },
    $route () {
      this.announcementDialogVisible = false
    }
  },
  methods: {
    removeHTML (strText) {
      const regEx = /<[^>]*>/g
      return strText.replace(regEx, '')
    },
    switchFloatAd () {
      this.floatAdVisible = !this.floatAdVisible
    },
    navigate (game) {
      this.$router.push(`/game/${game.id}/`)
    },
    formattedText (texts) {
      return texts.split('\r\n\r\n').join('<br/>')
    }
  },
  created () {
    if (this.$route.query.login) {
      this.$store.commit('SHOW_LOGIN_DIALOG')
    }
  },
  beforeDestroy () {
    clearTimeout(this.announcementTimer)
    clearInterval(this.interval)
  },
  mounted () {
    this.floatAdVisible = true
  }
}
</script>

<style lang="scss" scoped>
#home {
  background: white;
}

.skin__bg-wrapper {
  position: relative;
  top: 400px;
  width: 100%;

  .skin__bg {
    position: absolute;
    width: 100%;
    height: 690px;
    overflow: hidden;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .skin__dots {
    position: absolute;
    top: 230px;
    right: calc(50% - 595px - 90px);
    width: 510px;
    height: 450px;
    background-repeat: no-repeat;
    background-size: contain;
  }
}

.el-main {
  padding: 0;
  position: relative;
}

.el-carousel__item .banner-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
}

/*announcement*/
.announcement-wrapper {
  width: 1190px;
  margin: auto;
  height: 40px;
  background-color: rgba(0, 0, 0, 0);
  color: #666;
  .text {
    line-height: 40px;
    overflow: hidden;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    .text {
      white-space: nowrap;
    }
  }
}

.skin__wrapper {
  .skin__gamearea-wrapper{
    margin: 71px auto 40px auto;
    width: 1190px;
    height: 500px;
    border-radius: 12px;
    box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
  }
  .payments {
    background-color: rgba(0, 0, 0, 0);
  }
}

.activity-area {
  margin-bottom: 50px;

  .activity-area-title {
    margin: 40px auto;
    text-align: center;
    font-size: 20px;
    color: #4a4a4a;
  }
  .activities {
    display: flex;
    justify-content: center;
  }
  a {
    display: block;
    background-color: #f4f9ff;
    width: 270px;
    height: 90px;
    border-radius: 4px;

    &:hover {
      background-color: rgba(#f4f9ff, .7);
    }
    &:not(:last-child) {
      margin-right: 10px;
    }
  }
  .activity {
    display: flex;
  }
  .activity-icon {
    font-size: 26px;
    width: 120px;
    height: 120px;
    margin-top: -30px;
    
    img {
      width: 100%;
    }
  }
  .activity-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 5px;
  }
  .activity-title {
    font-weight: bold;
    color: #314762;
    font-size: 16px;
  }
  .activity-desc {
    color: #999;
    font-size: 14px;
    margin-top: 5px;
  }
}

/*game area*/
.gamearea-wrapper {
  margin: 40px auto;
  width: 1190px;
  .gamearea {
    .list-item {
      margin-right: -1px;
      margin-bottom: -1px;
      border: solid 1px #dedede;
    }
  }
}
.gamearea {
  margin: 0 auto;
  &-title {
    position: relative;
    width: 120px;
    height: 50px;
    margin: 40px auto;
    .text {
      position: absolute;
      left: 0;
      bottom: 0;
      font-size: 20px;
      color: #4a4a4a;
      z-index: 1;
    }
    .fire-image {
      position: absolute;
      top: 0;
      right: 0;
      height: 50px;
      z-index: 2;
    }
  }

  .list-item {
    cursor: pointer;
    float: left;
    position: relative;
    width: 169px;
    height: 169px;
    overflow: hidden;
    text-align: center;
  }

  .game-ad {
    height: 339px;
    width: 339px;
    .icon {
      height: 260px;
      width: 100%;
    }
    .text {
      font-size: 18px;
      line-height: 55px;
      text-align: center;
      color: #4a4a4a;
    }
  }
}

.game-icon {
  height: 100%;
  transition: all .3s ease;


  .img {
    top: 22px;
    transform: translateY(20%);
    line-height: 100px;
    width: 100px;
    height: 100px;
  }

  .name {
    position: absolute;
    margin: 0 auto;
    bottom: 11px;
    font-size: 14px;
    font-weight: 400;
    text-transform: uppercase;
    width: 100%;
    height: 28px;
    line-height: 28px;
    color: #4a4a4a;
    transition: all .3s ease;
  }
  &:hover {
    opacity: .8;
    .name {
      color: #156fd8;
    }
  }

  &.more {
    .name {
      color: #4a90e2;
    }
  }
}

.payments {
  text-align: center;
  margin: 0 auto;
  background-color: #f6f6f6;
  .img {
    margin: 30px auto;
    width: 469px * 0.8;
    height: 60px * 0.8;
  }
}

.ads {
  text-align: center;
  margin: 0 auto;
  margin-bottom: 50px;
  padding: 0 24px;
}

.ad {
  margin-top: 57px;
  padding-top: 5px auto;
}

.ad-title {
  width: 250px;
  height: 50px;
  margin: 0 auto;
  margin-bottom: 20px;
  text-align: center;
}

.content-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.71;
  text-align: left;
  color: #9b9b9b;
  height: 100%;
  overflow: hidden;
}

.el-carousel.announcement-popup /deep/ .el-carousel__button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: black;
}
.el-carousel.announcement-popup {
  /deep/ strong, b {
    font-weight: bold;
  }
  /deep/ em {
    font-style: italic;
  }
  .wrapper {
    height: 160px;
    overflow-y: auto;
  }
}
</style>

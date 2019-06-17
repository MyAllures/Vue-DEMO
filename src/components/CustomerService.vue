<template>
  <div class="container skin__customer-service" :class="{extended : chatRoomVisible}" v-show="customerServiceVisible">
    <Header />
    <Body />
    <Footer :ready="isTokenReady" />
    <ReviewDialog :show="showReview" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Header from './customerService/Header'
import Body from './customerService/Body'
import Footer from './customerService/Footer'
import ReviewDialog from './customerService/ReviewDialog'
import VenomSocketObj from '@/ws/venom'
import { fetchJWTToken } from '@/api'

export default {
  components: {
    Header,
    Body,
    Footer,
    ReviewDialog
  },
  data () {
    return {
      isTokenReady: false
    }
  },
  methods: {
    ...mapActions('customerService', [
      'showReviewDialog'
    ]),
    initWs () {
      if (!this.$store.state.ws.venom) {
        let venomTokenPromise
        let venomToken = this.$store.state.token.venom

        if (venomToken) {
          venomTokenPromise = Promise.resolve(venomToken)
        } else {
          venomTokenPromise = fetchJWTToken('venom').then(setting => {
            localStorage.setItem('venom_setting', JSON.stringify(setting))
            return setting.token
          })
        }

        venomTokenPromise.then(token => {
          this.isTokenReady = true
          this.$store.dispatch('token/addToken', {
            type: 'venom',
            token: token
          })
          this.$store.dispatch('setWs', { ws: new VenomSocketObj(token), type: 'venom' })
        }).catch(() => {})
      }
    }
  },
  computed: {
    ...mapState('customerService', {
      showReview: state => state.showReview,
      lastArchive: state => state.lastArchive,
      assigned: state => state.sessionAssigned
    }),
    ...mapGetters('customerService', {
      lastSession: 'lastSession',
      session: 'currentSession'
    }),
    customerServiceVisible () {
      return this.$route.query.service === 'on'
    },
    chatRoomVisible () { // for styling
      return this.$store.state.chatRoom.isShowing
    },
    isPreventReview () {
      if (this.session && this.session !== this.lastSession) {
        return !this.assigned
      }
      return !this.session && !this.lastSession
    }
  },
  watch: {
    customerServiceVisible: {
      handler (bool) {
        if (bool) {
          this.initWs()
        }
      },
      immediate: true
    },
    showReview (show) {
      if (show && this.isPreventReview) {
        this.$notify.warning({
          title: '错误',
          message: '先别急着评，先跟客服聊聊再说',
          duration: 4000,
          position: 'bottom-right'
        })
        this.showReviewDialog(false)
      }
    },
    lastArchive () {
      this.showReviewDialog()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/vars.scss';

.container {
  position: fixed;
  z-index: 2;
  padding: 0;
  bottom: 0;
  right: $rightmenu-width + 10;
  z-index: $z-customerservice;
  width: 500px;
  height: 500px;
  box-shadow: 0 2px 5px 1px rgba(0, 0, 0, .3);
}

.extended {
  right: 470px;
}
</style>

<template>
  <ul class="skin__nav main-navs">
    <li v-if="menu.path"
      :to="menu.path"
      @click="onClick(menu)"
      :class="getMenuClass(menu)"
      v-for="menu in menus"
      :key="menu.icon">
      <span :class="menu.eng ? 'big' : ''">{{menu.name}}</span>
      <span v-if="menu.eng" class="eng">{{menu.eng}}</span>
    </li>
    <li class="nav-link" v-if="$store.state.systemConfig.serviceAction">
      <span
        class="online-service m-r"
        target="_blank"
        @click="$store.state.systemConfig.serviceAction()">
        <span :class="menus[0].eng ? 'big' : ''">{{$t('navMenu.online_service')}}</span>
        <span v-if="menus[0].eng" class="eng">SERVICES</span>
      </span>
    </li>
  </ul>
</template>

<script>
import style from '../style'

export default {
  props: {
    menus: {
      type: Array
    }
  },
  data () {
    return {
      style
    }
  },
  methods: {
    getMenuClass (menu) {
      return {
        'active': this.$route.path.split('/')[1] === menu.path.slice(1),
        [menu.class]: menu.class,
        'nav-link': true
      }
    },
    onClick (menu) {
      let routePath = this.$route.path.split('/')[1]
      let menuPath = menu.path.split('/')[1]
      if (routePath !== menuPath) {
        this.$router.push({path: '/' + menuPath})
      }
    }
  }
}
</script>


<style lang="scss" scoped>
@import "../style/vars.scss";
.main-navs {
  float: right;
  height: 100%;
  display: flex;
  align-items: center;
}
.nav-link {
  display: inline-block;
  padding: 10px 15px;
  border-right: 1px solid #efefef;
  cursor: pointer;
  text-align: center;
  color: #666;
  font-size: 16px;
  &:last-child {
    border: none;
  }
}
.big {
  font-size: 16px;
}
.eng {
  display: block;
  font-size: 14px;
  line-height: 1.5;
  color: #999;
}
.online-service {
  display: block;
  &:visited {
    color: #666;
  }
}
</style>

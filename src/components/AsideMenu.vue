<template>
  <el-aside class="skin__aside-menu m-l m-r aside-menu" width="200px">
    <el-menu :default-active="active"
      text-color="#4a4a4a"
      active-text-color="#fff">
      <el-menu-item v-for="(item, index) in items"
        :index="item.route || ('' + index)"
        :key="index"
        class="aside-item"
        :style="{ marginBottom: item.marginBottom }"
        @click="onClick(item)"
        :router="true"
        v-if="item.condition === undefined || checkCondition(item.condition)">
        <icon v-if="item.leftIcon" :name="item.leftIcon" :class="['aside-icon', item.leftIcon]" />
        <!-- for making a distinction with api 'icon' filed -->
        <span slot="title" class="menu-text p-l">
          {{ item.display_name }}
          <el-badge class="mark" :value="badgeValue(item.badge)" v-if="badgeValue(item.badge)" />
        </span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    items: {
      type: Array
    },
    defaultActive: {
      type: String,
      default: '0'
    }
  },
  computed: {
    ...mapState('actv2', {
      referralEnabled: state => state.referral.enabled
    }),
    active: function () {
      return this.defaultActive.indexOf('online_payment_success') !== -1 ? '/account/online_payment' : this.defaultActive
    }
  },
  methods: {
    onClick (e) {
      let data = e.code || e
      this.$emit('clicked', data)
    },
    checkCondition (type) {
      switch (type) {
        case 'referrals':
          return this.referralEnabled
        default:
          return false
      }
    },
    badgeValue (type) {
      switch (type) {
        case 'referrals':
          return this.$store.state.actv2.referral.count
        default:
          return false
      }
    }
  }
}
</script>

<style lang="scss">
.el-menu {
  background-color: transparent;
}
</style>
<style lang="scss" scoped>
@import '../style/vars';
.aside-menu {
  overflow: hidden;
}
.aside-item {
  height: 40px;
  line-height: 40px;
  margin-right: 0;
  font-size: 14px;
  border-bottom: 1px solid #F9F9F9;
  background-color: #fff;
  &:not(.is-active) {
    &:hover {
      background-color: rgba(204, 204, 204, 1);
    }
  }
}

.aside .el-menu {
  border: none;
  .fa-icon {
    width: 20px;
  }
}
.el-menu .el-menu-item {
  &.is-active {
    position: relative;
    background: no-repeat 0px center;
    background-size: 200px 44px;
    border-bottom-width: 0;
    &::after {
      content: '';
      position: absolute;
      top: 16px;
      right: 12px;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 0 4px 8px;
      border-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) #fff;

    }
  }
}

.el-badge {
  margin-top: -6px;
  margin-left: 5px;

  .el-badge__content {
    height: 16px;
    padding: 0 4px;
  }
}
</style>

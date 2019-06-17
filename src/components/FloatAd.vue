<template>
  <div class="float-ad" :style="{
     position: 'fixed',
     right: '60px',
     top: '50%',
     marginTop: `-150px`,
     width: width,
     height: '315px',
     'z-index': 2
    }">
    <transition name="slide-fade">
      <div v-show="floatAdVisible" class="float-wp">
        <img class="ad-img" :src="content" alt="float-ad" @click="handleClick()"/><div class="close-btn" @click="$emit('switchFloatAd')"><i class="el-icon-circle-close-outline"></i> 关闭</div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    floatAdVisible: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '150px'
    },
    content: {
      type: String,
      require: true
    }
  },
  methods: {
    switchFloatAd () {
      this.$emit('switchFloatAd', !this.isVisible)
    },
    handleClick () {
      if (this.systemConfig.serviceAction) {
        this.systemConfig.serviceAction()
      }
    }
  },
  computed: {
    scrollWidth () {
      return window.innerWidth - document.body.clientWidth
    },
    ...mapState([
      'systemConfig'
    ])
  }
}
</script>

<style lang="scss" scoped>
.ad-trigger {
  display: block;
  color: #000;
}

.ad-img {
  width: 100%;
  height: 100%;
}

.float-wp {
  text-align: center;
}
.close-btn {
  padding: 0 10px;
  display: inline-block;
  background-color: rgba(0,0,0,.5);
  color: #ddd;
  text-align: center;
  cursor: pointer;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all .7s ease;
}

.slide-fade-enter, .slide-fade-leave-to{
  transform: translateX(10px);
  opacity: 0;
}
</style>

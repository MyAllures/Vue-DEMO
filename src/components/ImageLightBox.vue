<template>
  <div class="lightbox" v-show="show">
    <transition name="slide-fade">
      <img :src="src" v-if="show" />
    </transition>
    <div class="mask" @click="$emit('update:show', false)"></div>
  </div>
</template>

<script>
export default {
  name: 'ImageLightBox',
  props: {
    show: {
      type: Boolean
    },
    src: {
      type: String
    }
  },
  mounted () {
    if (this.show) {
      document.body.appendChild(this.$el)
    }
  },
  watch: {
    show (val) {
      if (val) {
        document.body.appendChild(this.$el)
      }
    }
  },
  destroyed () {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>

<style lang="scss" scoped>
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
img {
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  z-index: 1;
}
.mask {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(#000, .5);
  cursor: pointer;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter {
  transform: translateY(-10px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>

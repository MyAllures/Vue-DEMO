<template>
  <transition name="delay-out">
    <div class="custom-dialog" :class="classes" v-show="visible" :style="styles">
      <transition name="fade-up">
        <slot v-if="visible" />
      </transition>
      <transition name="fade">
        <div class="mask" v-if="visible" @click="hide"></div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    classes: [Object, Array],
    styles: Object,
    backClose: Boolean
  },
  mounted () {
    if (this.visible) {
      document.body.appendChild(this.$el)
    }
  },
  methods: {
    hide () {
      if (this.backClose === true) {
        this.$emit('update:visible', false)
        this.$emit('hide')
      }
    }
  },
  watch: {
    visible (val) {
      if (val === true) {
        document.body.style.overflow = 'hidden'
        document.body.appendChild(this.$el)
      } else {
        document.body.style.overflow = 'auto'
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
.custom-dialog {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(#000, .6);
}
</style>

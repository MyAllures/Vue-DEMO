<template>
  <i ref="point" class="red-point"></i>
</template>

<script>
export default {
  mounted () {
    this.$refs.point.parentElement.style.position = 'relative'
  }
}
</script>

<style lang="scss" scoped>
.red-point {
  display: block;
  position: absolute;
  top: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  background-color: #d0021b;
  border-radius: 50%;
  box-shadow: 0 0 1px 0 #000;
  box-sizing: border-box;
}
</style>

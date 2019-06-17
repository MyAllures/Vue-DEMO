<template>
  <div class="box-card">
    <p>一、{{name}}务</p>
  </div>
</template>
<script>
export default {
  data () {
    return {
      name: this.$store.state.systemConfig.siteName
    }
  }
}
</script>

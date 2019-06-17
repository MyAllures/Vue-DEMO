<template>
  <div class="box-card">
    <p>{{name}}</p>
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


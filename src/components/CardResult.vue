<template>
  <section class="cardresults-wrapper m-b"
    v-loading="NiuNiuResult.cardLoading"
    element-loading-text="等待开奖中"
    v-if="NiuNiuResult">
    <ul class="pokers" v-if="!animate">
      <li class="poker text-center"
        v-for="(value, key, index) in NiuNiuResult.extra_info"
        :key="index">
        <div :class="['pokers-name', key === 'n0' ? 'banker' : `player-${key}`]" ></div>
        <div class="pokers-wrap">
          <span class="win-badge" v-if="value.status === 'win'"></span>
          <span :class="['card', 'card-animation', `card-${displayCardNumber(card.number)}`, `card-type${card.cardType}`]"
            v-for="(card, index) in value.numbers"
            :key="index">
          </span>
        </div>
        <div :class="['pokers-rank', `rank-${value.niu_number}`]"></div>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  data () {
    return {
      animate: false
    }
  },
  props: {
    NiuNiuResult: {
      type: Object
    }
  },
  methods: {
    displayCardNumber (number) {
      let card
      if (number >= 10) {
        card = parseInt(4 * Math.random()) + 10
      } else {
        card = number
      }
      return card
    }
  },
  watch: {
    NiuNiuResult (val) {
      this.animate = true
      setTimeout(() => {
        this.animate = false
      }, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/card.scss";
.cardresults-wrapper {
  width: 100%;
  height: 145px;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #ecf5ff;
  z-index: 2;
}
</style>

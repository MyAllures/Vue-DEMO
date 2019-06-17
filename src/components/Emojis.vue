<template>
  <ul class="emojis">
    <li class="emoji clickable"
      @click="handleEmojiClick(emoji)"
      v-for="(emoji, index) in emojis"
      :key="index">
      <span>{{emoji.emoji}}</span>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    emojis: {
      type: Array
    }
  },
  methods: {
    handleEmojiClick (emoji) {
      this.$emit('emojiClick', emoji)
    }
  }
}
</script>

<style lang="scss" scoped>
.emojis {
  display: flex;
  height: 280px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.emoji {
  width: 50px;
  height: 40px;
  line-height: 40px;
  font-size: 24px;
  text-align: center;
  border: 2px solid transparent;
  box-sizing: border-box;

  &:hover {
    border-color: #ff5a00;
  }
}
</style>

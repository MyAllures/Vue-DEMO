<template>
  <el-dialog
    title="游戏筛选"
    :visible="visible"
    @update:visible="updateDialogVisible"
    width="600px"
    top="0"
    center
    show-close
    custom-class="game-filter-dialog"
    @closed="reset"
    append-to-body>
    <el-checkbox
      :disabled="submitting||!filters"
      :value="allActived"
      @input="handleSelectAll">全选</el-checkbox>
    <template v-if="filters">
      <filter-group
        v-for="gameGroup in mergedGameClassification"
        :key="gameGroup.tag"
        :group="gameGroup"
        :disabled="submitting"
        @update="updateGroupStatus"
        :filters="filters">
        <div class="content">
          <el-checkbox
            :disabled="filters[game.code]===undefined||submitting"
            v-model="filters[game.code]"
            v-for="game in gameGroup.games"
            :key="game.code">{{game.display_name}}</el-checkbox>
        </div>
      </filter-group>
    </template>
    <div slot="footer">
      <el-button size="medium" :loading="submitting" type="primary" @click="submit">确认</el-button>
      <el-button size="medium" @click="updateDialogVisible(false)" :disabled="submitting">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { msgFormatter } from '@/utils'
import FilterGroup from './GameFilterGroup'
import { eagle } from '@/api'
export default {
  name: 'GameFilterDialog',
  props: {
    visible: {
      type: Boolean
    }
  },
  components: {
    FilterGroup
  },
  data () {
    return {
      filters: null,
      submitting: false
    }
  },
  computed: {
    ...mapState([
      'gameClassification', 'user'
    ]),
    ...mapState('chatroom', {
      gameFilter: state => state.filter.game_settings
    }),
    mergedGameClassification () {
      if (!this.gameClassification) {
        return []
      }
      let result = []
      let combination
      this.gameClassification.forEach(item => {
        if (item.games.length > 3) {
          result.push(item)
        } else {
          if (combination) {
            combination.tag += ` ${item.tag}`
            combination.games = combination.games.concat(item.games)
            if (combination.games.length > 3) {
              combination = null
            }
          } else {
            combination = {...item}
            result.push(combination)
          }
        }
      })
      return result
    },
    allActived () {
      if (!this.filters) {
        return false
      }
      return Object.values(this.filters).every(bool => bool)
    }
  },
  watch: {
    gameFilter: {
      handler: function (filters) {
        this.filters = {...filters}
      },
      immediate: true
    }
  },
  methods: {
    updateDialogVisible (visible) {
      this.$emit('update:visible', visible)
    },
    submit () {
      this.submitting = true
      let setting = {game_settings: this.filters}
      eagle.updateChatRoomUserInfo(this.user.username, setting).then(res => {
        this.$store.dispatch('chatroom/updateFilter', setting)
        this.$emit('update:visible', false)
        this.$message({
          showClose: true,
          message: '已更新筛选条件',
          type: 'success'
        })
      }).catch(errorMsg => {
        this.$message({
          message: msgFormatter(errorMsg),
          type: 'error'
        })
      }).finally(() => {
        this.submitting = false
      })
    },
    reset () {
      this.filters = {...this.gameFilter}
    },
    updateGroupStatus (config) {
      config.games.forEach(game => {
        this.filters[game.code] = config.status
      })
    },
    handleSelectAll (val) {
      let filters = this.filters
      let keys = Object.keys(filters)
      keys.forEach(key => {
        this.filters[key] = val
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.el-dialog__wrapper /deep/ .el-dialog {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  max-width: calc(100% - 30px);
  max-height: calc(100% - 30px);
  .el-dialog__body {
    overflow-y: auto;
  }
}

.content {
  .el-checkbox {
    width: 120px;
    margin-right: 10px;
  }
}
</style>

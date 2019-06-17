<template>
  <div>
    <el-row class="m-b">
      <el-form :inline="true" :model="conditions">
        <el-form-item label="追号时间" prop="startDate" :error="startDateValidate">
          <el-date-picker
            v-model="startDate"
            type="date"
            :id="'date1'"
            :name="'date1'"
            :placeholder="$t('user.choose_date')"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item>~</el-form-item>
        <el-form-item prop="endDate" :error="endDateValidate">
          <el-date-picker
            v-model="endDate"
            :id="'date2'"
            :name="'date2'"
            type="date"
            :placeholder="$t('user.choose_date')"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('user.game_name')">
          <el-select v-model="selectedGame">
            <el-option
              key="all"
              :label="$t('common.all')"
              value="">
            </el-option>
            <el-option
              v-for="game in allGames"
              :key="game.id"
              :label="game.display_name"
              :value="game.code">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-row>
    <track-table
      :game="selectedGame"
      :startDate="startDate"
      :endDate="endDate"
      :pageSize="pageSize"
      :page="currentPage"
      :totalCount.sync="totalCount"/>
    <el-pagination
      v-if="totalCount > pageSize"
      :current-page.sync="currentPage"
      :page-size="pageSize"
      layout="total, prev, pager, next"
      :total="totalCount">
    </el-pagination>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import Vue from 'vue'
import TrackTable from '@/components/TrackTable'
const today = Vue.moment().format('YYYY-MM-DD')
export default {
  name: 'ReturnRecord',
  components: {
    TrackTable
  },
  filters: {
    statusFilter (value) {
      switch (value) {
        case false:
          return '等待派发中'
        case true:
          return '已派发'
        default:
          return '等待派发中'
      }
    }
  },
  data () {
    return {
      records: [],
      currentPage: this.$route.query.page || 1,
      pageSize: 20,
      totalCount: 0,
      loading: false,
      selectedGame: this.$route.query.game || '',
      startDate: this.$route.query.start_date || today,
      endDate: this.$route.query.end_date || today,
      startDateValidate: '',
      endDateValidate: ''
    }
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    conditions () {
      return {
        game: this.selectedGame,
        start_date: this.startDate,
        end_date: this.endDate,
        page: this.currentPage
      }
    }
  },
  watch: {
    'conditions': function (conditions) {
      let startDate = this.$moment(conditions.start_date)
      let endDate = this.$moment(conditions.end_date)
      if (startDate && endDate && startDate.diff(endDate) > 0) {
        this.startDateValidate = this.$t('validate.date_range_validate')
        this.endDateValidate = ''
      } else {
        this.startDateValidate = ''
        this.endDateValidate = ''
        this.$router.push({
          query: conditions
        })
      }
    },
    '$route': function (to) {
      this.currentPage = to.query.page
      this.selectedGame = to.query.game
      this.startDate = to.query.start_date
      this.endDate = to.query.end_date
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

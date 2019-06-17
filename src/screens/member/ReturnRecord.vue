<template>
  <div>
    <el-row class="m-b">
      <el-form :inline="true" :model="conditions">
        <el-form-item :label="$t('user.distribute_time')" prop="startDate" :error="startDateValidate">
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
    <el-table v-loading="loading" :data="records" stripe>
      <el-table-column :label="$t('user.distribute_time')">
        <template slot-scope="scope">
          <span v-if="scope.row.finish_return_amount">{{ scope.row.created_at | moment("YYYY-MM-DD HH:mm")}}</span>
          <span v-else>{{ scope.row.date | moment("YYYY-MM-DD")}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user.distribute_game')">
        <template slot-scope="scope">
          <span>{{ scope.row.display_name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="amount" :label="$t('user.distribute_amount')">
        <template slot-scope="scope">
          <span>{{ scope.row.return_amount | currency('￥')}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user.distribute_status')">
        <template slot-scope="scope">
          <span :class="{green:scope.row.finish_return_amount}">{{ scope.row.finish_return_amount|statusFilter }}</span>
        </template>
      </el-table-column>
    </el-table>
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
import { fetchReturnRecord } from '../../api'
import { msgFormatter } from '../../utils'
import { mapGetters } from 'vuex'
import Vue from 'vue'
const today = Vue.moment().format('YYYY-MM-DD')
export default {
  name: 'ReturnRecord',
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
      pageSize: 20,
      totalCount: 0,
      loading: false,
      currentPage: this.$route.query.page || 1,
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
      }
      this.$router.push({
        query: conditions
      })
    },
    '$route': function (to) {
      this.currentPage = to.query.page
      this.selectedGame = to.query.game
      this.startDate = to.query.start_date
      this.endDate = to.query.end_date
      this.initFetchReturnRecord(this.conditions)
    }
  },
  created () {
    if (Object.keys(this.$route.query).length === 0) {
      this.$router.replace({query: this.conditions})
    } else {
      this.initFetchReturnRecord(this.conditions)
    }
  },
  methods: {
    initFetchReturnRecord (option) {
      this.loading = true
      fetchReturnRecord({ ...option, offset: (option.page - 1) * this.pageSize })
        .then(data => {
          if (data.results) {
            this.totalCount = data.count
            this.records = data.results
          } else {
            this.totalCount = data.length
            this.records = data
          }
          this.loading = false
        }).catch(errorMsg => {
          this.$message({
            showClose: true,
            message: msgFormatter(errorMsg),
            type: 'error'
          })
        }).finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

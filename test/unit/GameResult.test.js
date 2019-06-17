import { shallowMount, createLocalVue } from '@vue/test-utils'
import GameResult from '@/components/GameResult.vue'
import Vuex from 'vuex'
jest.mock('@/components/AudioButton', () => {
  return {
    AudioButton: () => 'AudioButton'
  }
})

const $t = () => {
  return 'xxx'
}

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  state: {
    latestResultMap: {
      'bjkl8': {
        result_str: '01,03,07,14,19,22,27,28,31,33,34,35,39,41,49,50,53,67,72,74,2',
        game_code: 'bjkl8'
      },
      'hkl': {'issue_number': '2018119', 'result_str': '22,42,13,25,10,40,05', 'display_name': '香港六合彩', 'game_code': 'hkl', 'status': 'valid', 'zodiac': ['牛', '蛇', '狗', '狗', '牛', '羊', '马']}
    }
  }
})

describe('GameResult.vue', () => {
  it('bjkl8', () => {
    let wrapper = shallowMount(GameResult, {
      store,
      localVue,
      mocks: {
        $t
      },
      propsData: {
        gameCode: 'bjkl8'
      }})
    expect(wrapper.vm.resultNums).toEqual([{'class': 'ball result-bjkl8 resultnum-1'}, {'class': 'ball result-bjkl8 resultnum-3'}, {'class': 'ball result-bjkl8 resultnum-7'}, {'class': 'ball result-bjkl8 resultnum-14'}, {'class': 'ball result-bjkl8 resultnum-19'}, {'class': 'ball result-bjkl8 resultnum-22'}, {'class': 'ball result-bjkl8 resultnum-27'}, {'class': 'ball result-bjkl8 resultnum-28'}, {'class': 'ball result-bjkl8 resultnum-31'}, {'class': 'ball result-bjkl8 resultnum-33'}, {'class': 'ball result-bjkl8 resultnum-34'}, {'class': 'ball result-bjkl8 resultnum-35'}, {'class': 'ball result-bjkl8 resultnum-39'}, {'class': 'ball result-bjkl8 resultnum-41'}, {'class': 'ball result-bjkl8 resultnum-49'}, {'class': 'ball result-bjkl8 resultnum-50'}, {'class': 'ball result-bjkl8 resultnum-53'}, {'class': 'ball result-bjkl8 resultnum-67'}, {'class': 'ball result-bjkl8 resultnum-72'}, {'class': 'ball result-bjkl8 resultnum-74'}])
  })
  it('hkl', () => {
    let wrapper = shallowMount(GameResult, {
      store,
      localVue,
      mocks: {
        $t
      },
      propsData: {
        gameCode: 'hkl'
      }})
    expect(wrapper.vm.resultNums).toEqual([{'class': 'ball result-hkl resultnum-22 zodiac', 'zodiac': '牛'}, {'class': 'ball result-hkl resultnum-42 zodiac', 'zodiac': '蛇'}, {'class': 'ball result-hkl resultnum-13 zodiac', 'zodiac': '狗'}, {'class': 'ball result-hkl resultnum-25 zodiac', 'zodiac': '狗'}, {'class': 'ball result-hkl resultnum-10 zodiac', 'zodiac': '牛'}, {'class': 'ball result-hkl resultnum-40 zodiac', 'zodiac': '羊'}, {'text': '＋', 'class': 'text'}, {'class': 'ball result-hkl resultnum-5 zodiac', 'zodiac': '马'}])
  })
})

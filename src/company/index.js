
const companyMap = {
  'hg9q_1': {
    id: 1,
    name: 'cc722'
  },
  '75ue_2': {
    id: 2,
    name: 'fh801'
  },
  'cg8s_3': {
    id: 3,
    name: 'a59'
  },
  '8fn3_4': {
    id: 4,
    name: 'hm7899'
  },
  'ee9m_5': {
    id: 5,
    name: '6j'
  }
}

export default companyMap[process.env.company] || {id: 0, name: 'staging'}

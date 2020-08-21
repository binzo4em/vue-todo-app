// Vuex 학습 자료
export default {
  namespaced: true,
  // Data
  state: () => ({
    a: 123,
    b: []
  }),
  // Computed
  getters: {
    someGetter1 (state, getters) {
      return state.a + 1
    },
    someGetter2 (state, getters) {
      return state.a + getters.someGetter1
    }
  },
  mutations: {
    someMutation (state, payload) {
      state.a = 789
      state.b.push(payload)
    }
  },
  actions: {
    // 아래 4개는 전달되는 context에 포함되어 있음
    // state: state 접근, getters : getters 접근
    // commit : mutations 실행, dispatch : actions 실행
    someAction1 ({ state, getters, commit, dispatch }, payload) {
      state.a = 789 // actions에서는 state의 변수를 직접적으로 변경할 수 없다. 따라서 에러 발생
      state.b.push(payload) // 에러 발생
      commit('someMutation', payload)
    },
    someAction2 (context, payload) {
      context.commit('someMutations')
      context.dispatch('someAction1', payload)
    }
  }
}

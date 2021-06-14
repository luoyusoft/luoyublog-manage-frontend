export default {
  namespaced: true,
  state: {
    userId: 0,
    nickname: '',
    profile: ''
  },
  mutations: {
    updateUserId (state, userId) {
      state.userId = userId
    },
    updateNickname (state, nickname) {
      state.nickname = nickname
    },
    updateProfile (state, profile) {
      state.profile = profile
    }
  }
}

import { createStore } from 'vuex'

export default createStore({
  state: {
    socket: {},
    msgsData: [],
  },
  mutations: {
    updateSocket(state, socket) {
      state.socket = socket
    },
    updateMsgsData(state, msgsData) {
      state.msgsData = msgsData

    },
    appendNewMsgData(state, msgData) {
      // logic to append text if last and new msg owners are same
      if (state.msgsData.length == 0)
        state.msgsData.push(msgData)
      else {
        console.log(state.msgsData[state.msgsData.length - 1], msgData)
        //check if both usernames are same and time < 5min
        if (state.msgsData[state.msgsData.length - 1].username == msgData.username &&
          msgData.time - state.msgsData[state.msgsData.length - 1].time < 300) {
          console.log('same user')
          state.msgsData[state.msgsData.length - 1].text.push(msgData.text[0])
          state.msgsData[state.msgsData.length - 1].time = msgData.time
          // state.msgsData.push(msgs)
        }
        else {
          console.log('different user')
          state.msgsData.push(msgData)
        }
      }

    }
  },
  actions: {

  },
  getters: {

  },
})

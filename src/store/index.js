import { createStore } from 'vuex'

export default createStore({
  state: {
    socket: {},
    msgsData: [],
    usersCount:0,
    usersList:{}
  },
  mutations: {
    updateSocket(state, socket) {
      state.socket = socket
    },
    updateMsgsData(state, msgsData) {
      state.msgsData = msgsData
    },
    updateUsersCount(state, usersCount){
      state.usersCount  = usersCount
    },
    updateUsersList(state, usersList){
      state.usersList = usersList
    },
    
    appendNewMsgData(state, msgData) {
      // logic to append text if last and new msg owners are same
      if (state.msgsData.length == 0)
        state.msgsData.push(msgData)
      else {
        // console.log(state.msgsData[state.msgsData.length - 1], msgData)
        // console.log( msgData.time - state.msgsData[state.msgsData.length - 1].time)
        //check if both usernames are same and time < 5min
        if (state.msgsData[state.msgsData.length - 1].username == msgData.username &&
          msgData.time - state.msgsData[state.msgsData.length - 1].time < 300000) {
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

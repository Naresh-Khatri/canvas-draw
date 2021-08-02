<template>
  <div class="q-pa-md bg-dark" style="min-height: 80vh">
    <div class="q-my-xl">
      <span class="text-h3">ChatBox</span>
      <!-- <span class="q-ml-md" :key="getUsersCount">
        {{ getUsersCount }} Online
      </span> -->
    </div>
    <div class="text-right"> 🟢 {{ Object.keys($store.state.usersList).length }} Online</div>
    <div class="q-mb-lg">
      <span v-for="(user, index) in $store.state.usersList" :key="index">
        <q-chip color="primary">
          <q-avatar>
            <q-icon name="person" color="white" />
          </q-avatar>
          <span class="text-white">
            {{ user.username }}
          </span>
        </q-chip>
      </span>
    </div>
    <q-scroll-area ref="scrollArea" style="height: 55vh">
      <q-chat-message
        class="q-mx-md"
        name="Server"
        :text="['hey', 'how are you?']"
      />
      <q-chat-message
        class="q-mx-md"
        v-for="(msg, index) in getMsgsData"
        :key="index"
        :name="msg.username"
        :text="msg.text"
        :sent="msg.username == socket.username"
        :stamp="getTimespamp(msg.time)"
      />
    </q-scroll-area>
    <div>
      <q-input
        v-model="input"
        class="q-mt-md"
        rounded
        outlined
        label="message"
        dark
        @keydown.enter="send"
      >
        <template v-slot:append>
          <q-avatar>
            <q-icon name="send" @click="send" />
          </q-avatar>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      socket: {},
      input: "",
      updateTime: 0, //purely to update timestamps
      msgsData: this.$store.state.msgsData,
      usersList: this.$store.state.usersList,
    };
  },
  computed: {
    getUsersCount() {
      console.log(this.usersList)
      return Object.keys(this.usersList).length;
    },
    getMsgsData() {
      //if msgsData is used directly on chat-component it doesnt update
      //when previous msgs data is fetched. so using computed

      // console.log(this.$store.state.msgsData)
      return this.$store.state.msgsData;
    },
  },
  mounted() {
    this.socket = this.$store.state.socket;
    //getting userlist after 500ms
    setTimeout(() => {
      this.socket.emit('getUsersList')
    }, 500);
    this.socket.on("receiveUsersList", (data) => {

      console.log(data);
      this.$store.commit('updateUsersList', data)
    });
    this.socket.on("receiveMsg", (data) => {
      this.appendNewMsg(data);
      this.animateScroll();
    });
 
    setInterval(() => {
      // this.updateTime++;
    }, 1000);
    // console.log(this.msgsData);
  },
  methods: {
    animateScroll() {
      console.log("scrolling");
      this.$refs.scrollArea.setScrollPosition("vertical", 10000, 300);
    },
    getTimespamp(time) {
      const currentTime = Date.now();
      const timeDiff = currentTime - time;
      const secs = Math.ceil(timeDiff / 1000);
      if (secs > 3600) return `${Math.ceil(secs / 3600)}h ago`;
      else if (secs > 60) return `${Math.ceil(secs / 60)}m ago`;
      else return `${secs}s ago`;
    },
    send() {
      if (this.input == "") return;
      let payload = {
        username: this.socket.username,
        text: [this.input],
        time: Date.now(),
      };
      this.socket.emit("sendMsg", payload);
      this.appendNewMsg(payload);
      this.animateScroll();
      this.input = "";
    },
    appendNewMsg(data) {
      this.$store.commit("appendNewMsgData", data);
      // if (this.msgsData[this.msgsData.length - 1].username == data.username)
      //   this.msgsData[this.msgsData.length].text.push(data.text);
      // else this.msgsData.push(data);
    },
  },
};
</script>

<style></style>

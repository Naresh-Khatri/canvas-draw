<template>
  <div class="q-pa-md bg-dark" style="min-height: 80vh">
    <h4>ChatBox</h4>
    <q-scroll-area ref="scrollArea" style="height: 55vh">
      <q-chat-message name="Server" :text="['hey', 'how are you?']" />
      <q-chat-message
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
    };
  },
  computed: {
    getMsgsData() {
      //if msgsData is used directly on chat-component it doesnt update
      //when previous msgs data is fetched. so using computed
      console.log(this.$store.state.msgsData)
      return this.$store.state.msgsData;
    },
  },
  mounted() {
    this.socket = this.$store.state.socket;
    this.socket.on("receiveMsg", (data) => {
      this.appendNewMsg(data);
      this.animateScroll();
    });
    setInterval(() => {
      // this.updateTime++;
    }, 1000);
    console.log(this.msgsData);
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

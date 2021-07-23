<template>
  <DrawCanvas />
</template>

<script>
import DrawCanvas from "../components/DrawCanvas.vue";
import io from "socket.io-client";

export default {
  components: { DrawCanvas },
  name: "PageIndex",
  data() {
    return {
      socket: {},
    };
  },
  created() {
    // this.socket = io('wss://draw.plasmatch.in')
    // this.socket = io("ws://147.139.72.188:3000/");
    this.socket = io("ws://localhost:3000/");
      this.$store.commit('updateSocket', this.socket)
    this.$q.loading.show({
      message: "Connecting to Server...",
      boxClass: "bg-grey-2 text-grey-9",
      spinnerColor: "primary",
    });
    this.socket.on('getPrevMsgsData',data=>{
      this.$store.commit('updateMsgsData',data)
    })
    this.socket.on("connect", () => {
      console.log('connected to ws!')
      this.$q.loading.hide();

      if (localStorage.getItem("username")) {
        this.socket.username = localStorage.getItem("username");
      } else {
        this.$q
          .dialog({
            title: "What is your name?",
            prompt: {
              model: "",
              type: "text", // optional
            },
            persistent: true,
          })
          .onOk((enteredUsername) => {
            this.socket.username = enteredUsername;
            this.$q.notify({
              message: `logged in as <strong>${enteredUsername}</strong>!`,
              color: "positive",
            });
            localStorage.setItem("username", enteredUsername);
          });
      }
    });
    
  },
};
</script>

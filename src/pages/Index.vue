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
      uniqueUsername: false,
    };
  },
  created() {
    this.socket = io("wss://draw.plasmatch.in");
    // this.socket = io("wss://147.139.72.188/");
    // this.socket = io("ws://localhost:3000/");
    this.$store.commit("updateSocket", this.socket);
    this.$q.loading.show({
      message: "Connecting to Server...",
      boxClass: "bg-grey-2 text-grey-9",
      spinnerColor: "primary",
    });
    this.socket.on("receivePrevMsgsData", (data) => {
      this.$store.commit("updateMsgsData", data);
    });
    this.socket.on("userJoin", (user) => {
      this.$q.notify({
        message: `<strong>${user.username} </strong> has joined! 🤟`,
        html: true,
        color: "positive",
      });
    });
    this.socket.on("userLeft", (user) => {
      this.$q.notify({
        message: `<strong>${user.username} </strong> has left! 😧`,
        html: true,
        color: "negative",
      });
    });
    this.socket.on("connect", () => {
      console.log("connected to ws!");
      this.$q.loading.hide();

      if (localStorage.getItem("username")) {
        this.socket.username = localStorage.getItem("username");
        this.socket.emit("userJoin", {
          username: this.socket.username,
          id: this.socket.id,
        });
      } else {
        this.$q
          .dialog({
            title: "What is your name?",
            prompt: {
              model: "",
              type: "text", // optional
              isValid: (val) => {
                let isUnique = true;
                Object.values(this.$store.state.usersList).forEach((user) => {
                  if (user.username == val) {
                    console.log("username same");
                    isUnique = false;
                  }
                });
                return val.length > 2 && isUnique;
              }, // allow if username length >2
            },
            persistent: true,
          })
          .onOk((enteredUsername) => {
            this.socket.username = enteredUsername;
            this.$q.notify({
              message: `logged in as <strong>${enteredUsername}</strong>!`,
              html: true,
              color: "positive",
            });
            this.socket.emit("userJoin", {
              username: this.socket.username,
              id: this.socket.id,
            });
            localStorage.setItem("username", enteredUsername);
          });
      }
    });
  },
  methods: {
    isUniqueUsername(username) {
      Object.values(this.$store.state.usersList).forEach((user) => {
        if (user.username == username) {
          console.log("username same");
          return false;
        }
      });
      return true;
    },
  },
};
</script>

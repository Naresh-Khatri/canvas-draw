<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="chat"
          aria-label="Menu"
          @click="leftDrawer = true"
        >
          <transition enter-active-class="animated bounceInLeft">
            <q-badge color="orange" v-show="unreadMsgsCount" floating>{{
              unreadMsgsCount
            }}</q-badge>
          </transition>
        </q-btn>
        <q-toolbar-title> Drawing App </q-toolbar-title>
        <div v-if="!showPing" @click="startPinging">
          <q-btn label="Show ping" />
        </div>
        <div v-else><q-btn :label="getPingText" @click="stopPinging" /></div>
        <q-btn icon="logout" color="negative" class="q-pa-sm" @click="logout" />
      </q-toolbar>
      <q-drawer v-model="leftDrawer" dark>
        <ChatBox />
      </q-drawer>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import ChatBox from "../components/ChatBox.vue";

export default {
  name: "MainLayout",
  components: {
    ChatBox,
  },

  data() {
    return {
      leftDrawer: false,
      unreadMsgsCount: 0,
      socket: {},
      showPing: false,
      ping: 'pinging...',
      pingInterval: null,
    };
  },
  computed: {
    getPingText() {
      return `${this.ping} ms`;
    },
  },
  watch: {
    leftDrawer: function () {
      this.unreadMsgsCount = 0;
    },
  },
  mounted() {
    this.socket = this.$store.state.socket;
    this.socket.on("receiveMsg", () => {
      this.unreadMsgsCount++;
    });
    this.socket.on("ping", (time) => {
      // console.log(Date.now() ,time)
      this.ping = Date.now() - time;
    });
  },

  methods: {
    logout() {
      localStorage.setItem("username", "");
      this.$router.go();
      this.$q.notify({ message: "Logged out!", color: "negative" });
    },
    startPinging() {
      this.showPing = true;
      this.pingInterval = setInterval(() => {
        this.socket.emit("ping", Date.now());
      }, 1000);
    },
    stopPinging() {
      this.showPing = false;
      clearInterval(this.pingInterval);
    },
  },
};
</script>

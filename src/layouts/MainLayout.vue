<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
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
        <q-btn icon="logout" @click="logout" />
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
    };
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
  },
  methods: {
    logout() {
      localStorage.setItem("username", "");
      this.$router.go();
      this.$q.notify({ message: "Logged out!", color: "negative" });
    },
  },
};
</script>

<template>
    <DrawCanvas :socket="socket"/>
</template>

<script>
import DrawCanvas from '../components/DrawCanvas.vue';
import io from 'socket.io-client'


export default {
  components: { DrawCanvas },
  name: 'PageIndex',
  data(){
    return{
      socket:{}
    }
  },
  created(){
    this.socket = io('ws://localhost:3000')
  },
  mounted(){
  },
}
</script>

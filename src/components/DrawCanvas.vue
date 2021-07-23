<template>
  <div class="q-pt-md">
    <div class="flex justify-evenly">
      <q-btn
        round
        color="primary"
        :disable="cStep < 0"
        icon="undo"
        @click="undo"
        :key="strokesList"
      />
      <q-btn
        round
        color="primary"
        :disable="false"
        icon="redo"
        @click="redo"
        :key="strokesList"
      />
      <q-btn
        round
        :style="
          hex == '#fff'
            ? 'background:#1976D2;color:white;'
            : 'background:' + hex + ';color:white;'
        "
        icon="palette"
        @click="changingColor = !changingColor"
      />
      <q-btn round color="primary" @click="toggleEraser"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
          focusable="false"
          width="2em"
          height="2em"
          style="
            -ms-transform: rotate(360deg);
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          "
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95l-4.95 4.95z"
            fill="#fff"
          />
        </svg> </q-btn
      ><q-btn round color="negative" icon="delete" @click="deleteCanvas" />
      <q-color
        v-show="changingColor"
        v-model="hex"
        style="z-index: 10"
        default-view="palette"
        class="my-picker absolute"
      />
    </div>
    <div class="flex justify-center q-pt-md">
      <div class="flex row items-center">
        <q-icon color="primary" size="md" class="q-pr-md" name="brush" />
        <q-slider
          style="width: 300px"
          v-model="brushSize"
          :min="1"
          :max="20"
          label
          color="primary"
        />
      </div>
    </div>
    <div class="flex column items-center">
      <div :style="canvasOwner ? 'opacity:1' : 'opacity:0'">
        <strong>{{ canvasOwner }}</strong> is drawing canvas
      </div>
      <canvas
        style="border: 2px solid black"
        ref="canvas"
        @resize="resize()"
        @mousemove="mousemove"
        @mousedown="mousedown"
        @mouseup="mouseup"
        @touchstart="mousedown"
        @touchend="mouseup"
        @touchmove="touchmove"
      ></canvas>
    </div>
    {{ canPainting }}
    {{ socket.username }} ({{ socket.id }}) {{ strokesList.length }}{{ cStep }}
    <!-- <img
      style="transform: scale(0.3)"
      v-for="img in strokesList"
      :src="img"
      :key="img"
    /> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      socket: {},
      eraserActive: false,
      painting: false,
      canPainting: true,
      canvasOwner: "",
      strokes: [], //hold all strokes' points array
      strokesList: [],
      redo_list: [],
      currentStroke: [],
      removedStrokes: [],
      hex: "#1976D2",
      brushSize: 10,
      changingColor: false,
      ctx: null,
      cStep: -1,
    };
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext("2d");

    this.resize();
    this.$refs.canvas.ontouchmove = function (e) {
      e.preventDefault();
    };
    this.socket = this.$store.state.socket;
    console.log(this.socket);
    this.addSocketListeners();
  },
  watch: {
    hex: function () {
      this.changingColor = false;
    },
    eraserActive: function () {
      if (this.eraserActive)
        this.$refs.canvas.style = `border: 3px solid red;
        cursor: url('https://api.iconify.design/mdi-eraser.svg?height=24')
           4 12, auto`;
      else this.$refs.canvas.style = `border: 1px solid black;cursor: default`;
    },
  },
  methods: {
    resize() {
      // this.$refs.canvas.width = window.innerWidth - 100;
      // this.$refs.canvas.height = window.innerHeight / 1.5;
      this.$refs.canvas.width = 350;
      this.$refs.canvas.height = 500;
    },
    addSocketListeners() {
      this.socket.on("lockCanvas", (username) => {
        this.canvasOwner = username;
        this.canPainting = false;
      });
      this.socket.on("releaseCanvas", (canvasData) => {
        this.cStep++;
        this.strokesList.push(canvasData);
        if(this.cStep<this.strokesList.length-1){
          this.strokesList.length = this.cStep
        }
        this.reDrawCanvas(false);
        // console.log(canvasData);
        this.canvasOwner = "";
        this.canPainting = true;
      });
      this.socket.on("receiveUndo", (user) => {
        this.$q.notify({ message: `${user.username} did an undo!` });
        this.cStep--;
        this.reDrawCanvas(true);
      });
      this.socket.on("receiveRedo", (user) => {
        this.$q.notify({ message: `${user.username} did a redo!` });
        this.cStep++;
        this.reDrawCanvas(true);
      });
      this.socket.on("brushMove", (data) => {
        // console.log(data);
        this.currentStroke.push([
          Number.parseInt(data.points[0]),
          Number.parseInt(data.points[1]),
        ]);
        this.ctx.beginPath();
        this.ctx.lineWidth = data.brushSize;
        this.ctx.strokeStyle = data.hex;
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.ctx.lineTo(data.points[0], data.points[1]);
        this.ctx.stroke();
      });
      this.socket.on("clearCanvas", (data) => {
        this.$q.notify({
          message: `${data.username} cleared the canvas!`,
          color: "negative",
        });
        this.$store.state.msgsData.push(data);
        this.clearCanvas(data);
      });
    },
    mousedown(e) {
      if (!this.canPainting) return;
      this.painting = true;
      if (this.removedStrokes) this.removedStrokes = [];
      this.currentStroke = [];
      this.ctx.beginPath();
      this.socket.emit("lockCanvas", this.socket.username);
      this.mousemove(e);
    },
    mousemove(e) {
      if (!this.painting || !this.canPainting) return;
      this.dot(e);
      let payload = {
        points: [
          e.clientX - this.getOffset(this.$refs.canvas).left,
          e.clientY - this.getOffset(this.$refs.canvas).top,
        ],
        hex: this.eraserActive ? "#fff" : this.hex,
        brushSize: this.brushSize,
      };
      this.socket.emit("brushMove", payload);
      // console.log(payload)
    },
    touchmove(e) {
      if (!this.painting || !this.canPainting) return;
      this.dotTouch(e);
      let payload = {
        points: [
          e.touches[0].clientX - this.getOffset(this.$refs.canvas).left,
          e.touches[0].clientY - this.getOffset(this.$refs.canvas).top,
        ],
        hex: this.eraserActive ? "#fff" : this.hex,
        brushSize: this.brushSize,
      };
      this.socket.emit("brushMove", payload);
    },
    dotTouch(e) {
      this.currentStroke.push([
        Number.parseInt(e.touches[0].clientX),
        Number.parseInt(e.touches[0].clientY),
      ]);

      this.ctx.lineWidth = this.brushSize;
      this.ctx.strokeStyle = this.eraserActive ? "#fff" : this.hex;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.lineTo(
        e.touches[0].clientX - this.getOffset(this.$refs.canvas).left,
        e.touches[0].clientY - this.getOffset(this.$refs.canvas).top
      );
      this.ctx.stroke();
    },
    dot(e) {
      this.currentStroke.push([
        Number.parseInt(e.clientX),
        Number.parseInt(e.clientY),
      ]);

      this.ctx.lineWidth = this.brushSize;
      this.ctx.strokeStyle = this.eraserActive ? "#fff" : this.hex;
      this.ctx.lineJoin = "round";
      this.ctx.lineCap = "round";
      this.ctx.lineTo(
        e.clientX - this.getOffset(this.$refs.canvas).left,
        e.clientY - this.getOffset(this.$refs.canvas).top
      );
      this.ctx.stroke();
    },
    mouseup() {
      this.painting = false;
      // this.strokes.push({
      //   strokePoints: this.currentStroke,
      //   hex: this.hex,
      //   brushSize: this.brushSize,
      // });
      this.cStep++;
      this.strokesList.push(this.$refs.canvas.toDataURL());
      // console.log(this.strokesList);
      this.socket.emit("releaseCanvas", this.$refs.canvas.toDataURL());
      // console.log(this.strokes);
      if (this.cStep < this.strokesList.length - 1) {
        console.log("yes");
        this.strokesList.length = this.cStep;
      }
    },
    test() {},
    undo() {
      // this.removedStrokes.unshift(this.strokes.pop());
      this.socket.emit("sendUndo", {
        id: this.socket.id,
        username: this.socket.username,
      });
      if (this.strokesList <= 0) return;
      this.cStep--;
      this.reDrawCanvas(true);
    },
    redo() {
      if (this.cStep >= this.strokesList.length - 1) {
        this.$q.notify({ message: "max limit!" });
        return;
      }
      this.socket.emit("sendRedo", {
        id: this.socket.id,
        username: this.socket.username,
      });
      this.cStep++;
      this.reDrawCanvas(true);
    },
    clearCanvas(data) {
      console.log(data.username + " cleared canvas");
      this.ctx.fillStyle = "rgb(255, 255, 255)";
      this.ctx.clearRect(
        0,
        0,
        this.$refs.canvas.width,
        this.$refs.canvas.height
      );
    },
    reDrawCanvas(clear) {
      if (clear)
        this.ctx.clearRect(
          0,
          0,
          this.$refs.canvas.width,
          this.$refs.canvas.height
        );
      // this.strokesList.push(this.redo_list.pop());

      // console.log(this.strokesList[this.cStep]);
      const canvasPic = new Image();
      canvasPic.src = this.strokesList[this.cStep];
      canvasPic.onload = () => {
        this.ctx.drawImage(canvasPic, 0, 0);
      };
      // this.strokes.push(this.removedStrokes.shift());
      // this.redrawCanvas();
    },
    toggleEraser() {
      this.eraserActive = !this.eraserActive;
    },
    getOffset(el) {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
    },
    deleteCanvas() {
      this.$q
        .dialog({
          title: "wtf brah?",
          message: "Would you like to clear canvas?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          let payload = { id: this.socket.id, username: this.socket.username };
          this.clearCanvas(payload);
          this.socket.emit("clearCanvas", payload);
        });
    },

    // addStroke(e) {
    //   this.strokes.push([
    //     Number.parseInt(e.clientX),
    //     Number.parseInt(e.clientY),
    //   ]);
    // },
  },
};
</script>

<style></style>

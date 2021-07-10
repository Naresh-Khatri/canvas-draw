<template>
  <div class="q-pt-md">
    <div class="flex justify-evenly">
      <q-btn
        round
        color="primary"
        icon="undo"
        @click="undo"
        :disabled="strokes.length <= 0"
        :key="strokes"
      />
      <q-btn
        round
        color="primary"
        icon="redo"
        @click="redo"
        :disabled="removedStrokes.length <= 0"
        :key="strokes"
      />
      <q-btn
        round
        :style="hex =='#fff'?'background:#1976D2;color:white;': 'background:' + hex + ';color:white;'"
        icon="palette"
        @click="changingColor = !changingColor"
      /><q-btn round color="primary" @click="toggleEraser"
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
        </svg>
      </q-btn>
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
    <div class="flex justify-center">
      <canvas
        style="border: 1px solid black; margin: 50px"
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      painting: false,
      strokesCount: 0,
      strokes: [], //hold all strokes' points array
      currentStroke: [],
      removedStrokes: [],
      hex: "#1976D2",
      brushSize: 10,
      changingColor: false,
    };
  },
  mounted() {
    this.resize();
    this.$refs.canvas.ontouchmove = function (e) {
      e.preventDefault();
    };
  },
  watch: {
    hex: function () {
      this.changingColor = false;
    },
    painting: function () {
      console.log(this.painting);
    },
  },
  // updated(){
  //   console.log(this.hex)
  // },
  methods: {
    resize() {
      // console.log("resizing");
      this.$refs.canvas.width = window.innerWidth - 100;
      this.$refs.canvas.height = window.innerHeight / 1.5;
    },
    mousedown(e) {
      this.painting = true;
      if (this.removedStrokes) this.removedStrokes = [];
      this.currentStroke = [];
      const ctx = this.$refs.canvas.getContext("2d");
      ctx.beginPath();

      this.mousemove(e);
    },
    mousemove(e) {
      if (!this.painting) return;
      this.dot(e);
    },
    touchmove(e) {
      if (!this.painting) return;
      // console.log(e.touches[0]);
      this.currentStroke.push([
        Number.parseInt(e.touches[0].clientX),
        Number.parseInt(e.touches[0].clientY),
      ]);

      const ctx = this.$refs.canvas.getContext("2d");
      ctx.lineWidth = this.brushSize;
      ctx.strokeStyle = this.hex;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineTo(
        e.touches[0].clientX - this.getOffset(this.$refs.canvas).left,
        e.touches[0].clientY - this.getOffset(this.$refs.canvas).top
      );
      ctx.stroke();
      // this.dot(e);
    },
    dot(e) {
      this.currentStroke.push([
        Number.parseInt(e.clientX),
        Number.parseInt(e.clientY),
      ]);

      const ctx = this.$refs.canvas.getContext("2d");
      ctx.lineWidth = this.brushSize;
      ctx.strokeStyle = this.hex;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineTo(
        e.clientX - this.getOffset(this.$refs.canvas).left,
        e.clientY - this.getOffset(this.$refs.canvas).top
      );
      ctx.stroke();
    },
    mouseup() {
      this.painting = false;
      this.strokes.push({
        strokePoints: this.currentStroke,
        hex: this.hex,
        brushSize: this.brushSize,
      });
      // this.strokesCount++;
      // console.log(this.strokes);
    },
    undo() {
      this.removedStrokes.unshift(this.strokes.pop());
      // console.log(this.removedStrokes);
      this.redrawCanvas();
    },
    redo() {
      this.strokes.push(this.removedStrokes.shift());
      this.redrawCanvas();
    },
    redrawCanvas() {
      const ctx = this.$refs.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      this.strokes.forEach((stroke) => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.hex;
        ctx.lineWidth = stroke.brushSize;
        ctx.lineJoin = "round";

        ctx.lineCap = "round";

        stroke.strokePoints.forEach((point) => {
          ctx.lineTo(
            point[0] - this.getOffset(this.$refs.canvas).left,
            point[1] - this.getOffset(this.$refs.canvas).top
          );

          ctx.stroke();
        });
      });
    },
    toggleEraser() {
      this.hex = "#fff";
    },
    getOffset(el) {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
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

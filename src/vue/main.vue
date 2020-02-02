<template>
  <div class="doc-wrap">
    <ripple v-if="inited"></ripple>
    <div class="scene-wrap" ref="scene">
    </div>
  </div>
</template>

<script>
import ripple from "./ripple.vue";

export default {
  name: "main_vue",

  components: {
    ripple,
  },

  data() {
    return {
      inited: false,    // Флаг инициализации сцены

      box: "",
      width: window.innerWidth,   // ширина сцены (по умолчанию все окно)
      height: window.innerHeight,   // высота сцены (по умолчанию все окно)

      scene: "",
      camera: "",
      renderer: "",
      mouse: "",

      /** Фигуры всякие */
      noise: "",
    }
  },

  mounted() {
    this.box = this.$refs.scene;
    this.width = this.box.clientWidth;
    this.height = this.box.clientHeight;
    this.initThree();

    window.addEventListener("resize", this.updateSize);
  },

  methods: {
    updateSize() {
      this.width = this.box.clientWidth;
      this.height = this.box.clientHeight;
      // this.camera.aspect = this.width / this.height;
      // this.camera.updateProjectionMartix();
      this.renderer.setSize( this.width, this.height );
    },

    initThree() {
      this.scene = new THREE.Scene();
      // this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 1, 1000 );
      // this.camera.position.z = 0.05;
      this.camera = new THREE.Camera();
      // this.camera.position.x = 2.5;
      // this.camera.position.z = 500;
      
      this.renderer = new THREE.WebGLRenderer({
        // alpha: true
      });

      this.renderer.setSize( this.width, this.height );
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.box.appendChild( this.renderer.domElement );

      this.inited = true;
    },

    // start() {
    //   this.getSizes()

    //   this.animateNoise()
    // },

    // getSizes() {
    //   const sizes = this.$refs.image_cont.getBoundingClientRect();

    //   this.addNoise(sizes);
    // },
  }
}
</script>

<style lang="scss" scoped>
::v-deep canvas {
  width: 100%;
  height: 100%;
}
.doc-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.scene-wrap { 
  width: 100%;
  height: 100%;
  touch-action: none;
}
</style>
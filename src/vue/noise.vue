<template>
  
</template>

<script>
import * as THREE from 'three';
// import { Easing, Tween, autoPlay, gsap } from 'es6-tween';
import gsap from 'gsap';
import fragmentShader from '../glsl/noise/fragmentShader.glsl';
import vertexShader from '../glsl/noise/vertexShader.glsl';

export default {
  name: "noise",

  image: "/img/frame_1.jpg",
  hover: "/img/frame_2.jpg",

  data() {
    return {
      inited: false,    // Инициальзирован ли меш

      geometry: "",
      material: "",
      uniforms: "",
      mesh: "",
      sizes: new THREE.Vector2(0, 0),

      mouse: new THREE.Vector2(0, 0),
    }
  },

  mounted() {
    this.initMesh();

    this.$parent.$refs.scene.addEventListener('mousemove', ev => {
      this.onMouseMove(ev);
    });
  },

  methods: {
    // Инициализация меша
    initMesh() {
      this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

      const loader = new THREE.TextureLoader();

      let hover = loader.load(this.$options.hover);
      let image = loader.load(this.$options.image, () => {
        console.log("image", image.image);
        this.uniforms = {
          u_image: { type: 't', value: image },
          u_imagehover: { type: 't', value: hover },
          u_mouse: { value: this.mouse },
          u_time: { value: 1 },
          u_res: { value: new THREE.Vector2(this.$parent.width, this.$parent.height) }
        };

        this.material = new THREE.ShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          defines: {
              PR: window.devicePixelRatio.toFixed(1)
          }
        });

        this.mesh = new THREE.Mesh( this.geometry, this.material );
        // this.mesh.position.x = -1;
        // this.mesh.position.z = 1;

        this.sizes = new THREE.Vector2(0, 0);
        this.sizes.set(image.image.naturalWidth, image.image.naturalHeight);
        this.mesh.scale.set(this.sizes.x * 2, this.sizes.y * 2, 1);

        this.$parent.scene.add( this.mesh );

        this.animation();
      });
    },

    onMouseMove(event) {
      gsap.to(this.mouse, 0.5, {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      })
    },

    animation() {
      requestAnimationFrame( this.animation );
      this.count();
      this.$parent.renderer.render( this.$parent.scene, this.$parent.camera );
    },

    count() {
      this.uniforms.u_time.value += 0.01
    },
  }
}
</script>

<style>

</style>
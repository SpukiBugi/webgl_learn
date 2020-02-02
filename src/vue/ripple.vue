<template>
  
</template>

<script>
import fragmentShader from '../glsl/ripple/fragmentShader.glsl';
import vertexShader from '../glsl/ripple/vertexShader.glsl';

export default {
  name: "ripple",

  image: "/img/head_back.jpg",
  // image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/tiling-mosaic.jpg',

  data() {
    return {
      inited: false,    // Инициальзирован ли меш

      geometry: "",
      material: "",
      uniforms: "",
      mesh: "",

      rtTexture: "",
      rtTexture2: "",

      mouse: {
        x: 0,
        y: 0
      },
      press_time: "",
    }
  },

  mounted() {
    this.initMesh();
  },

  methods: {
    // Инициализация меша
    initMesh() {
      let divisor = 1 / 8;
      let textureFraction = 1 / 1;
      let image = this.$options.image;

      const loader = new THREE.TextureLoader();

      let texture, environment, pooltex;
      loader.setCrossOrigin("anonymous");
      loader.load(
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png',
        (tex) => {
          texture = tex;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.minFilter = THREE.LinearFilter;
          
          loader.load( 
            'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/env_lat-lon.png',
            function environment_load(tex) {
              environment = tex;
              environment.wrapS = THREE.RepeatWrapping;
              environment.wrapT = THREE.RepeatWrapping;
              environment.minFilter = THREE.NearestMipMapNearestFilter;
              
              loader.load(
                image,
                function environment_load(tex) {
                  pooltex = tex;
                  pooltex.wrapS = THREE.RepeatWrapping;
                  pooltex.wrapT = THREE.RepeatWrapping;
                  pooltex.minFilter = THREE.NearestMipMapNearestFilter;
                  
                  onTexLoad();
                  animate();
                }
              )
            }
          );
        }
      );

      let onTexLoad = () => {

        this.geometry = new THREE.PlaneBufferGeometry( 2, 2 );

        this.rtTexture = new THREE.WebGLRenderTarget(Math.floor(window.innerWidth * textureFraction), Math.floor(window.innerHeight * textureFraction), { type: THREE.FloatType, minFilter: THREE.NearestMipMapNearestFilter });
        
        this.rtTexture2 = new THREE.WebGLRenderTarget(Math.floor(window.innerWidth * textureFraction), Math.floor(window.innerHeight * textureFraction), { type: THREE.FloatType, minFilter: THREE.NearestMipMapNearestFilter });

        let scale = new THREE.Vector2();
        scale.x = 1024 / window.innerWidth;
        scale.y = 576 / window.innerHeight;
        console.log(scale);
        this.uniforms = {
          u_time: { type: "f", value: 1.0 },
          u_resolution: { type: "v2", value: new THREE.Vector2() },
          u_noise: { type: "t", value: texture },
          u_buffer: { type: "t", value: this.rtTexture.texture },
          u_texture: { type: "t", value: pooltex }, 
          u_environment: { type: "t", value: environment },
          u_mouse: { type: "v3", value: new THREE.Vector3() },
          u_frame: { type: "i", value: -1. },
          u_renderpass: { type: 'b', value: false },
          u_scale: {type: "v2", value: scale}
        };

        this.material = new THREE.ShaderMaterial( {
          uniforms: this.uniforms,
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        } );
        this.material.extensions.derivatives = true;

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.$parent.scene.add( this.mesh );
    

        let onWindowResize = () => {   
          this.uniforms.u_resolution.value.x = this.$parent.width;
          this.uniforms.u_resolution.value.y = this.$parent.height;
          this.rtTexture = new THREE.WebGLRenderTarget(window.innerWidth * textureFraction, window.innerHeight * textureFraction);
          this.rtTexture2 = new THREE.WebGLRenderTarget(window.innerWidth * textureFraction, window.innerHeight * textureFraction);
          
          this.uniforms.u_frame.value = -1;
        };

        onWindowResize();
        window.addEventListener( 'resize', onWindowResize, false );

        let ripple = (e)=> {
          clearTimeout(this.press_time);
          this.uniforms.u_mouse.value.z = 1;
          let ratio = window.innerHeight / window.innerWidth;
          if(window.innerHeight > window.innerWidth) {
            this.mouse.x = (e.pageX - window.innerWidth / 2) / window.innerWidth;
            this.mouse.y = (e.pageY - window.innerHeight / 2) / window.innerHeight * -1 * ratio;
          } else {
            this.mouse.x = (e.pageX - window.innerWidth / 2) / window.innerWidth / ratio;
            this.mouse.y = (e.pageY - window.innerHeight / 2) / window.innerHeight * -1;
          }

          this.press_time = setTimeout(() => {
            this.uniforms.u_mouse.value.z = 0;
          }, 100)
          
          e.preventDefault();
        }
    
        this.$parent.box.addEventListener('pointermove', ripple);
        this.$parent.box.addEventListener('click', ripple);
        // this.$parent.box.addEventListener('mouseover', ()=> {
        //   this.uniforms.u_mouse.value.z = 1;
        // });
        this.$parent.box.addEventListener('mouseout', ()=> {
          this.uniforms.u_mouse.value.z = 0;
        });
      };

      let animate = (delta) => {
        requestAnimationFrame( animate );
        render(delta);
      };

      let beta = Math.random() * -1000;
      let render = (delta) => {
        this.uniforms.u_frame.value++;
        
        this.uniforms.u_mouse.value.x += ( this.mouse.x - this.uniforms.u_mouse.value.x ) * divisor;
        this.uniforms.u_mouse.value.y += ( this.mouse.y - this.uniforms.u_mouse.value.y ) * divisor;
        
        // this.uniforms.u_time.value = beta + delta * 0.0005;
        this.$parent.renderer.render( this.$parent.scene, this.$parent.camera );
        renderTexture();
      };

      let renderTexture = (delta) => {

        // let r1 = this.rtTexture;
        // let r2 = this.rtTexture2;
        
        let odims = this.uniforms.u_resolution.value.clone();
        this.uniforms.u_resolution.value.x = window.innerWidth * textureFraction;
        this.uniforms.u_resolution.value.y = window.innerHeight * textureFraction;

        this.uniforms.u_buffer.value = this.rtTexture2.texture;
        
        this.uniforms.u_renderpass.value = true;
        
        window.rtTexture = this.rtTexture;
        this.$parent.renderer.setRenderTarget(this.rtTexture);
        this.$parent.renderer.render( this.$parent.scene, this.$parent.camera, this.rtTexture, true );
        
        let buffer = this.rtTexture;
        this.rtTexture = this.rtTexture2;
        this.rtTexture2 = buffer;

        this.uniforms.u_buffer.value = this.rtTexture.texture;
        this.uniforms.u_resolution.value = odims;
        this.uniforms.u_renderpass.value = false;
      }
    },
  }
}
</script>

<style>

</style>
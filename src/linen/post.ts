import * as THREE from 'three';

export function makeFinish(texture: THREE.Texture) {
  const uniforms = { image: { value: texture }, resolution: { value: new THREE.Vector2(640, 520) }, time: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D image;
      uniform vec2 resolution;
      uniform float time;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      void main(){
        vec2 uv=vUv;
        float edge=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));
        float blur=(1.-smoothstep(.02,.22,edge))*12.;
        vec3 base=texture2D(image,uv).rgb;
        vec3 sum=base;
        vec3 glow=vec3(0.);
        for(int i=0;i<12;i++){
          float angle=float(i)*2.399963;
          vec2 direction=vec2(cos(angle),sin(angle));
          vec2 offset=direction*sqrt((float(i)+.5)/12.);
          sum+=texture2D(image,uv+offset*blur/resolution).rgb;
          vec3 bright=texture2D(image,uv+offset*16./resolution).rgb;
          glow+=max(bright-vec3(8.),vec3(0.));
        }
        vec3 result=sum/13.+glow/12.*.055;
        gl_FragColor=vec4(result,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        float edgeNoise=(sin(uv.x*31.+uv.y*17.)+sin(uv.y*47.-uv.x*13.))*.002;
        float feather=smoothstep(.012,.19,edge+edgeNoise);
        float grain=(hash(gl_FragCoord.xy)-.5)*.035;
        gl_FragColor.rgb+=grain;
        gl_FragColor.rgb=mix(vec3(.972549,.972549,.960784),gl_FragColor.rgb,feather);
      }
    `,
    depthTest: false, depthWrite: false,
  });
  const scene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);scene.add(quad);
  return { scene, camera: new THREE.Camera(), uniforms, dispose(){quad.geometry.dispose();material.dispose();} };
}

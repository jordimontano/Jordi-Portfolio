import * as THREE from 'three';

function randomSource(seed: number) {
  return () => {seed = Math.imul(seed, 1664525) + 1013904223 | 0;return (seed >>> 0) / 4294967296;};
}

export function linenTexture() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  const random = randomSource(84);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const warp = Math.pow(Math.sin(x * Math.PI / 4), 2);
      const weft = Math.pow(Math.sin(y * Math.PI / 4), 2);
      const over = ((x >> 2) + (y >> 2)) % 2;
      const thread = over ? warp * .65 + weft * .35 : weft * .65 + warp * .35;
      const slub = Math.sin(y * .17) * Math.sin(x * .024) * 3;
      const value = 222 + thread * 26 + random() * 7 + slub;
      const i = (y * size + x) * 4;
      data[i] = value;data[i + 1] = value - 3;data[i + 2] = value - 10;data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 9);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function plasterTexture() {
  const random = randomSource(47);
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < data.length; i += 4) {
    const tone = 228 + random() * 24;
    data[i] = data[i + 1] = data[i + 2] = tone;data[i + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 7);
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function makeLinen(texture: THREE.Texture) {
  const material = new THREE.MeshPhysicalMaterial({
    color: '#e8e1d3', map: texture, bumpMap: texture, bumpScale: .013,
    roughness: .96, metalness: 0, side: THREE.DoubleSide,
    sheen: .8, sheenColor: new THREE.Color('#fff6d8'), sheenRoughness: .9,
    transparent: true, opacity: .81, depthWrite: true,
  });
  // Thin-fabric backscatter supplements the shared scene lighting. This is an
  // artistic approximation of subsurface transmission, not glass transmission.
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vFabricUv;\nvarying vec3 vFabricNormal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFabricUv = uv;\nvFabricNormal = normalize(mat3(modelMatrix) * normal);');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vFabricUv;\nvarying vec3 vFabricNormal;')
      .replace('#include <opaque_fragment>', `
        vec3 clothNormal = normalize(vFabricNormal);
        float backlit = pow(max(0., dot(-clothNormal, normalize(vec3(-.45, .62, -.68)))), .65);
        float hem = max(1. - smoothstep(.014, .035, min(vFabricUv.x, 1. - vFabricUv.x)),
                       1. - smoothstep(.012, .035, min(vFabricUv.y, 1. - vFabricUv.y)));
        outgoingLight *= 1. - hem * .17;
        outgoingLight += vec3(1.0, .85, .58) * backlit * .40 * (1. - hem * .75);
        #include <opaque_fragment>
      `);
  };
  material.customProgramCacheKey = () => 'linen-backscatter-v1';
  return material;
}

/** Original city panorama, drawn once; layers of haze keep the distant detail quiet. */
export function cityTexture() {
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1400;
  const c=canvas.getContext('2d')!;
  const random=randomSource(107);
  const sky=c.createLinearGradient(0,0,0,1400);
  sky.addColorStop(0,'#8ebfda');sky.addColorStop(.36,'#c7e0e7');sky.addColorStop(.63,'#f5e7c9');sky.addColorStop(1,'#ddc6a0');
  c.fillStyle=sky;c.fillRect(0,0,1200,1400);
  // A broad sun halo, kept away from the spire, lights the open stretch of sky.
  const sunGlow=c.createRadialGradient(770,440,8,770,440,420);
  sunGlow.addColorStop(0,'#fff8dfef');sunGlow.addColorStop(.17,'#fff4d3b0');sunGlow.addColorStop(.55,'#fff0cd48');sunGlow.addColorStop(1,'#fff2d000');
  c.fillStyle=sunGlow;c.fillRect(0,0,1200,1100);
  c.fillStyle='#fffbed';c.beginPath();c.arc(770,440,19,0,Math.PI*2);c.fill();
  // Long, luminous cloud banks sit above the skyline.
  c.filter='blur(15px)';
  for(let i=0;i<22;i++){
    c.fillStyle=`rgba(255,249,232,${.07+random()*.12})`;
    c.beginPath();c.ellipse(random()*1400-100,180+random()*330,80+random()*220,6+random()*17,-.08,0,Math.PI*2);c.fill();
  }
  c.filter='none';
  function building(x:number,base:number,w:number,h:number,depth:number){
    const y=base-h;
    const palettes=[['#b5c7c9','#a4bdc5','#eee6ce'],['#c7bfaa','#91a5ab','#f3dfb4'],['#c2a080','#927f6d','#f3d6a7']];
    const palette=palettes[depth];
    const face=c.createLinearGradient(x,y,x+w*.72,y);
    face.addColorStop(0,palette[2]);face.addColorStop(.18,palette[0]);face.addColorStop(1,palette[0]);
    c.fillStyle=face;c.fillRect(x,y,w,h);
    c.fillStyle=palette[1];c.fillRect(x+w*.72,y,w*.28,h);
    c.fillStyle=palette[2];c.fillRect(x-2,y-3,w+4,4);
    const spacing=depth===2?16:11;
    for(let wy=y+10;wy<base-4;wy+=spacing){
      for(let wx=x+6;wx<x+w*.72-3;wx+=spacing*.72){
        c.fillStyle=random()>.82?'rgba(255,239,200,.75)':`rgba(60,85,98,${depth===0?.075:.13+random()*.12})`;
        c.fillRect(wx,wy,depth===2?5:3,depth===2?8:5);
      }
    }
    if(depth===2){
      c.fillStyle='#6d706a';c.fillRect(x+w*.22,y-9,w*.35,9);
      c.strokeStyle='rgba(69,66,58,.45)';c.lineWidth=1;
      for(let fy=y+32;fy<base;fy+=48){c.beginPath();c.moveTo(x,fy);c.lineTo(x+w*.72,fy);c.stroke();}
    }
  }
  // Far towers, a stepped central spire, then more intimate rooftops.
  for(let x=-20;x<1230;){const w=22+random()*43;building(x,950,w,90+random()*225,0);x+=w-3;}
  building(545,960,72,415,0);building(557,548,48,40,0);building(568,511,27,26,0);
  c.fillStyle='#b7c9c8';c.fillRect(579,448,5,44);
  c.beginPath();c.moveTo(581,415);c.lineTo(584,450);c.lineTo(579,450);c.fill();
  const haze=c.createLinearGradient(0,620,0,1040);haze.addColorStop(0,'#fff0cf00');haze.addColorStop(1,'#f5dfb982');c.fillStyle=haze;c.fillRect(0,620,1200,450);
  for(let x=-30;x<1230;){const w=36+random()*62;building(x,1150,w,120+random()*265,1);x+=w+3;}
  for(let x=-40;x<1240;){const w=72+random()*96;const h=110+random()*145;building(x,1400,w,h,2);
    if(random()>.52){
      const tx=x+w*.45,ty=1400-h-53;
      c.strokeStyle='#686b64';c.lineWidth=3;
      c.beginPath();c.moveTo(tx-14,ty+24);c.lineTo(tx-18,ty+53);c.moveTo(tx+14,ty+24);c.lineTo(tx+18,ty+53);c.stroke();
      c.fillStyle='#777970';c.fillRect(tx-19,ty,38,31);c.beginPath();c.moveTo(tx-23,ty);c.lineTo(tx,ty-13);c.lineTo(tx+23,ty);c.fill();
      c.strokeStyle='#aaa18c';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.moveTo(tx-19,ty+i*8);c.lineTo(tx+19,ty+i*8);c.stroke();}
    }x+=w+8;
  }
  // A restrained veil of afternoon light ties the foreground and distance together.
  const warmth=c.createLinearGradient(1100,300,150,1350);
  warmth.addColorStop(0,'#ffedbf24');warmth.addColorStop(.6,'#fff0d00a');warmth.addColorStop(1,'#ffe6bb00');
  c.fillStyle=warmth;c.fillRect(0,0,1200,1400);
  // Small imperfections keep flat façades from looking mechanically tiled.
  c.globalAlpha=.035;
  for(let i=0;i<32000;i++){c.fillStyle=random()>.5?'#fff6de':'#364a55';c.fillRect(random()*1200,random()*1400,1,1);}
  c.globalAlpha=1;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  return texture;
}

/** Invert Three's ACES fit so the unshadowed wall lands on the exact page color. */
export function paperRadiance(exposure: number) {
  const color = new THREE.Color('#f8f8f5');
  const output = new THREE.Matrix3().set(1.60475,-.53108,-.07367,-.10208,1.10813,-.00605,-.00327,-.07276,1.07602);
  const input = new THREE.Matrix3().set(.59719,.35458,.04823,.076,.90834,.01566,.0284,.13383,.83777);
  const vector = new THREE.Vector3(color.r,color.g,color.b).applyMatrix3(output.invert());
  const inverseFit = (value:number) => {
    const a=.983729*value-1,b=.432951*value-.0245786,c=.238081*value+.000090537;
    return (-b-Math.sqrt(b*b-4*a*c))/(2*a);
  };
  vector.set(inverseFit(vector.x),inverseFit(vector.y),inverseFit(vector.z)).applyMatrix3(input.invert()).multiplyScalar(.6/exposure);
  return new THREE.Color().setRGB(vector.x,vector.y,vector.z);
}

export function paperMaterial(exposure: number) {
  const material = new THREE.MeshStandardMaterial({ color:'#f8f8f5', roughness:1 });
  const radiance=paperRadiance(exposure);
  material.onBeforeCompile=shader=>{
    shader.uniforms.paperRadiance={value:radiance};
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 paperRadiance;')
      .replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>')
      .replace('#include <opaque_fragment>',`float roomShadow = 1.;
        #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 1
          DirectionalLightShadow roomLight = directionalLightShadows[1];
          roomShadow = getShadow(directionalShadowMap[1], roomLight.shadowMapSize, roomLight.shadowIntensity, roomLight.shadowBias, roomLight.shadowRadius, vDirectionalShadowCoord[1]);
        #endif
        outgoingLight = mix(paperRadiance * .24, paperRadiance, roomShadow);\n#include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=> 'page-matched-shadow-receiver-v1';
  return material;
}

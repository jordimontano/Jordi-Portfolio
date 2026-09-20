import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LinenCloth, COLUMNS, ROWS, TOP, PANEL_WIDTH, BASE_Z } from './cloth';
import { cityTexture, linenTexture, makeLinen, paperMaterial, paperRadiance } from './materials';
import { makeFinish } from './post';

export type SceneControls = { paused: boolean; opening: number; reducedMotion: boolean };

function clothGeometry(cloth: LinenCloth) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(cloth.positions.slice(), 3).setUsage(THREE.DynamicDrawUsage));
  const uvs: number[] = [], indices: number[] = [];
  for (let row = 0; row <= ROWS; row++) {
    for (let col = 0; col <= COLUMNS; col++) {
      uvs.push(col / COLUMNS, 1 - row / ROWS);
      if (col < COLUMNS && row < ROWS) {
        const a = row * (COLUMNS + 1) + col, b = a + COLUMNS + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

export function createLinenScene(canvas: HTMLCanvasElement, controls: SceneControls) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = paperRadiance(renderer.toneMappingExposure);
  const camera = new THREE.PerspectiveCamera(33, 1.2, .1, 50);
  camera.position.set(0, .65, 10.1);
  camera.lookAt(0, .15, 0);
  const environmentScene = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentScene, .03);
  scene.environment = environment.texture;
  scene.environmentIntensity = .25;
  environmentScene.dispose();pmrem.dispose();

  const textures = [linenTexture(), cityTexture()];
  textures[0].anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const plaster = paperMaterial(renderer.toneMappingExposure);
  const paint = new THREE.MeshStandardMaterial({ color: '#e4deca', roughness: .59 });
  const reveal = new THREE.MeshStandardMaterial({ color: '#d6ceba', roughness: .9 });
  const metal = new THREE.MeshStandardMaterial({ color: '#79644a', roughness: .39, metalness: .76 });
  const metalDark = new THREE.MeshStandardMaterial({ color: '#4e493b', roughness: .47, metalness: .7 });
  const timber = new THREE.MeshStandardMaterial({ color: '#968265', roughness: .68 });
  const linen = makeLinen(textures[0]);
  const materials: THREE.Material[] = [plaster, paint, reveal, metal, metalDark, timber, linen];
  const group = new THREE.Group();scene.add(group);

  function box(w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material,parent:THREE.Object3D=group) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function cylinder(radius:number,length:number,x:number,y:number,z:number,material:THREE.Material,axis:'x'|'z'|'y'='x') {
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,32),material);
    if(axis==='x')mesh.rotation.z=Math.PI/2;
    if(axis==='z')mesh.rotation.x=Math.PI/2;
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  }

  // A real opening in the wall. Sunlight can only enter through this aperture.
  box(3.0,8,.32,-2.96,.2,-.30,plaster);
  box(3.0,8,.32,2.96,.2,-.30,plaster);
  box(2.92,2.7,.32,0,3.08,-.30,plaster);
  box(2.92,2.7,.32,0,-2.77,-.30,plaster);
  const floor=box(11,.12,11,0,-1.69,2.7,plaster);
  floor.name='floor';
  // Deep plaster returns and the outer wooden casing.
  box(.15,3.13,.46,-1.40,.12,-.08,reveal);
  box(.15,3.13,.46,1.40,.12,-.08,reveal);
  box(2.95,.13,.46,0,1.64,-.08,reveal);
  box(3.05,.14,.63,0,-1.39,.07,paint);
  box(3.2,.065,.70,0,-1.32,.10,paint);
  for(const x of [-1.51,1.51])box(.10,3.15,.055,x,.14,.0,paint);
  box(3.1,.10,.055,0,1.72,0,paint);
  box(3.10,.085,.055,0,-1.43,0,paint);

  const outside=new THREE.Mesh(new THREE.PlaneGeometry(4.8,5.4),new THREE.MeshBasicMaterial({map:textures[1],color:'#ffffff'}));
  outside.position.set(0,.45,-2.4);group.add(outside);materials.push(outside.material);
  const glass=new THREE.MeshPhysicalMaterial({color:'#edf0ef',metalness:0,roughness:.12,transparent:true,opacity:.055,side:THREE.DoubleSide,depthWrite:false});
  materials.push(glass);

  function sash(parent:THREE.Object3D,center:number) {
    const w=1.30,h=2.81;
    box(.068,h,.085,center-w/2,0,0,paint,parent);
    box(.068,h,.085,center+w/2,0,0,paint,parent);
    box(w,.073,.085,center,h/2,0,paint,parent);
    box(w,.073,.085,center,-h/2,0,paint,parent);
    box(w,.043,.070,center,.24,0,paint,parent);
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(w-.07,h-.075),glass);
    pane.position.set(center,0,.005);parent.add(pane);
  }
  const leftSash=new THREE.Group();leftSash.position.set(-.68,.15,-.11);group.add(leftSash);sash(leftSash,0);
  const rightHinge=new THREE.Group();rightHinge.position.set(1.33,.15,-.11);group.add(rightHinge);sash(rightHinge,-.65);
  // Small hinges and a working brass latch make the opening legible.
  for(const y of [-.91,1.06])cylinder(.022,.12,1.34,y,-.055,metalDark,'y');
  // Keep the latch on the sash stile, not floating over the distant skyline.
  box(.039,.13,.026,-1.30,.09,.063,paint,rightHinge);
  box(.025,.085,.025,-1.30,.09,.090,paint,rightHinge);
  // Brackets physically connect the rod to the same wall that receives its shadow.
  for(const x of [-1.88,1.88]) {
    cylinder(.09,.028,x,1.91,-.10,metal,'z');
    cylinder(.024,.56,x,1.91,.17,metal,'z');
    cylinder(.021,.12,x,1.96,.45,metal,'y');
    for(const y of [1.865,1.955]) {
      const screw=cylinder(.01,.01,x,y,-.079,metalDark,'z');screw.castShadow=false;
    }
  }
  cylinder(.034,4.17,0,1.94,.46,metal);
  for(const side of [-1,1]) {
    cylinder(.045,.09,side*2.06,1.94,.46,metal);
    const finial=new THREE.Mesh(new THREE.SphereGeometry(.072,24,16),metal);
    finial.scale.set(1.2,.88,.88);finial.position.set(side*2.15,1.94,.46);finial.castShadow=true;group.add(finial);
  }

  const cloths=([-1,1] as const).map(side=>{
    const simulation=new LinenCloth(side);
    const mesh=new THREE.Mesh(clothGeometry(simulation),linen);
    mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
    mesh.name=side===-1?'left-linen':'right-linen';
    mesh.geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.1,1),4);group.add(mesh);
    for(let ring=0;ring<=6;ring++) {
      const u=ring/6;
      const x=side===-1?-1.70+u*PANEL_WIDTH:.09+u*PANEL_WIDTH;
      const torus=new THREE.Mesh(new THREE.TorusGeometry(.062,.008,8,24),metal);
      torus.rotation.y=Math.PI/2;torus.position.set(x,1.88,.46);torus.castShadow=true;group.add(torus);
      box(.021,.075,.026,x,1.782,BASE_Z+.063,metalDark);
    }
    return {simulation,mesh};
  });

  scene.add(new THREE.HemisphereLight('#fff9e6','#b2aa88',.85));
  const sun=new THREE.DirectionalLight('#ffefd0',5.2);
  sun.position.set(-3.5,5,-5);sun.target.position.set(.6,-1.3,2.5);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:20});
  sun.shadow.bias=-.0002;sun.shadow.normalBias=.035;sun.shadow.radius=3;sun.shadow.blurSamples=6;
  scene.add(sun,sun.target);
  const bounce=new THREE.DirectionalLight('#fff5dd',1.9);
  bounce.position.set(-3,3.6,5);bounce.target.position.set(0,0,0);
  // Preserve the narrow sash's moving shadow as it swings away from the wall.
  bounce.castShadow=true;bounce.shadow.mapSize.set(2048,2048);
  Object.assign(bounce.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.1,far:15});
  bounce.shadow.bias=-.0002;bounce.shadow.normalBias=.012;bounce.shadow.radius=5;bounce.shadow.blurSamples=8;bounce.shadow.intensity=.65;
  scene.add(bounce,bounce.target);

  // Fine suspended dust catches the same warm atmosphere, concentrated at the opening.
  const dustPositions=new Float32Array(42*3);
  for(let i=0;i<42;i++){dustPositions[i*3]=Math.sin(i*19.7)*1.6;dustPositions[i*3+1]=Math.cos(i*47.3)*1.6;dustPositions[i*3+2]=.6+(Math.sin(i*32.1)*.5+.5)*1.3;}
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dustMaterial=new THREE.PointsMaterial({color:'#fff8da',size:.009,transparent:true,opacity:.36,depthWrite:false});materials.push(dustMaterial);
  const dust=new THREE.Points(dustGeometry,dustMaterial);group.add(dust);

  const target=new THREE.WebGLRenderTarget(640,520,{type:THREE.HalfFloatType,depthBuffer:true});
  target.samples=Math.min(4,renderer.capabilities.maxSamples);
  const finish=makeFinish(target.texture);
  const clock={time:0,previous:0,frame:0,visible:true,disposed:false,frames:0,meanMs:0,meanFrameMs:16.67};
  let opening=controls.opening;
  let contextLost=false;
  const raycaster=new THREE.Raycaster();
  const pointer=new THREE.Vector2();
  const dragPlane=new THREE.Plane(new THREE.Vector3(0,0,1),-.8);
  const intersection=new THREE.Vector3();
  let grabbed:typeof cloths[number]|null=null;
  let pointerId:number|null=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced=()=>controls.reducedMotion||reduced.matches;

  function upload() {
    for(const cloth of cloths){cloth.simulation.interpolate(cloth.mesh.geometry.attributes.position.array as Float32Array);cloth.mesh.geometry.attributes.position.needsUpdate=true;cloth.mesh.geometry.computeVertexNormals();}
  }
  // Start from a hanging, lightly wind-filled state rather than an unrelaxed grid.
  for(let i=0;i<150;i++)for(const cloth of cloths)cloth.simulation.advance(1/60,controls.opening);
  upload();

  function render() {
    if(contextLost||clock.disposed)return;
    rightHinge.rotation.y=THREE.MathUtils.degToRad(opening);
    finish.uniforms.time.value=clock.time;
    renderer.setRenderTarget(target);renderer.render(scene,camera);
    renderer.setRenderTarget(null);renderer.render(finish.scene,finish.camera);
    clock.frames++;
    // DOM-backed diagnostics support verification without exposing controls in the UI.
    canvas.dataset.frames=String(clock.frames);
    canvas.dataset.motion=isReduced()?'reduced':controls.paused?'paused':'running';
    canvas.dataset.opening=opening.toFixed(1);
    canvas.dataset.grabbed=grabbed?'true':'false';
    canvas.dataset.clothZ=cloths[1].simulation.positions[(ROWS*(COLUMNS+1)+16)*3+2].toFixed(4);
    canvas.dataset.renderMs=clock.meanMs.toFixed(2);
    canvas.dataset.frameMs=clock.meanFrameMs.toFixed(2);
  }
  function tick(now:number) {
    clock.frame=0;
    const start=performance.now();
    const delta=clock.previous?Math.min((now-clock.previous)/1000,.05):0;
    if(clock.previous)clock.meanFrameMs=clock.meanFrameMs*.95+(now-clock.previous)*.05;
    clock.previous=now;
    const stationary=controls.paused||isReduced();
    opening=stationary?controls.opening:THREE.MathUtils.lerp(opening,controls.opening,1-Math.exp(-delta*5));
    if(!stationary){
      clock.time+=delta;
      for(const cloth of cloths)cloth.simulation.advance(delta,opening);
      upload();
      dust.rotation.y=Math.sin(clock.time*.09)*.06;
      dust.position.y=Math.sin(clock.time*.17)*.08;
    }
    render();
    clock.meanMs=clock.meanMs*.95+(performance.now()-start)*.05;
    if(!clock.disposed&&clock.visible&&!document.hidden&&!stationary&&!contextLost)clock.frame=requestAnimationFrame(tick);
    else clock.previous=0;
  }
  function wake(){if(!clock.disposed&&!clock.frame&&clock.visible&&!document.hidden&&!contextLost)clock.frame=requestAnimationFrame(tick);}
  function resize(){
    const box=canvas.getBoundingClientRect();
    const width=Math.max(1,box.width),height=Math.max(1,box.height);
    renderer.setSize(width,height,false);
    const ratio=renderer.getPixelRatio();target.setSize(Math.round(width*ratio),Math.round(height*ratio));
    finish.uniforms.resolution.value.set(width*ratio,height*ratio);
    camera.aspect=width/height;
    // Keep the brackets and finials inside the camera on narrow screens.
    camera.position.z=camera.aspect<1.05?11.2:10.1;
    camera.updateProjectionMatrix();render();wake();
  }
  function ray(event:PointerEvent){
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
  }
  function down(event:PointerEvent){
    if(event.button!==0||pointerId!==null||controls.paused||isReduced())return;
    ray(event);
    const hit=raycaster.intersectObjects(cloths.map(c=>c.mesh),false)[0];
    if(!hit||!hit.uv)return;
    const row=Math.max(2,Math.min(ROWS,Math.round((1-hit.uv.y)*ROWS)));
    const col=Math.max(0,Math.min(COLUMNS,Math.round(hit.uv.x*COLUMNS)));
    grabbed=cloths.find(c=>c.mesh===hit.object)!;
    grabbed.simulation.grab={index:row*(COLUMNS+1)+col,x:hit.point.x,y:hit.point.y,z:hit.point.z};
    dragPlane.constant=-hit.point.z;pointerId=event.pointerId;canvas.setPointerCapture(event.pointerId);
    canvas.dataset.drags=String(Number(canvas.dataset.drags||0)+1);
    canvas.dataset.grabbed='true';canvas.style.cursor='grabbing';event.preventDefault();
    wake();
  }
  function move(event:PointerEvent){
    if(pointerId!==null&&event.pointerId!==pointerId)return;
    ray(event);
    if(grabbed&&grabbed.simulation.grab){
      if(raycaster.ray.intersectPlane(dragPlane,intersection)){
        const g=grabbed.simulation.grab;g.x=THREE.MathUtils.clamp(intersection.x,-2,2);g.y=THREE.MathUtils.clamp(intersection.y,-1.5,TOP-.1);g.z=THREE.MathUtils.clamp(intersection.z+.1,.4,1.8);
        wake();
      }
    }else if(event.pointerType==='mouse'){
      canvas.style.cursor=raycaster.intersectObjects(cloths.map(c=>c.mesh),false).length?'grab':'default';
    }
  }
  function release(event?:PointerEvent){
    if(event&&pointerId!==null&&event.pointerId!==pointerId)return;
    if(grabbed){grabbed.simulation.grab=null;grabbed=null;}
    if(pointerId!==null&&canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);
    pointerId=null;canvas.dataset.grabbed='false';canvas.style.cursor='grab';
  }
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const inView=new IntersectionObserver(([entry])=>{clock.visible=entry.isIntersecting;if(clock.visible)wake();else{cancelAnimationFrame(clock.frame);clock.frame=0;clock.previous=0;release();}});inView.observe(canvas);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(clock.frame);clock.frame=0;clock.previous=0;release();}else wake();};
  const preference=()=>{release();wake();};
  const lost=(event:Event)=>{event.preventDefault();contextLost=true;cancelAnimationFrame(clock.frame);clock.frame=0;canvas.dataset.context='lost';};
  const restored=()=>{contextLost=false;canvas.dataset.context='ready';resize();};
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',preference);
  canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
  canvas.dataset.context='ready';resize();
  return {
    wake(){if(controls.paused||isReduced())release();wake();},
    breeze(){if(!controls.paused&&!isReduced()){for(const cloth of cloths)cloth.simulation.breathe();canvas.dataset.breezes=String(Number(canvas.dataset.breezes||0)+1);wake();}},
    dispose(){
      clock.disposed=true;cancelAnimationFrame(clock.frame);release();observer.disconnect();inView.disconnect();
      document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preference);
      canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',release);canvas.removeEventListener('pointercancel',release);canvas.removeEventListener('lostpointercapture',release);
      canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);
      scene.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Points)object.geometry.dispose();});
      for(const material of materials)material.dispose();for(const texture of textures)texture.dispose();
      finish.dispose();target.dispose();environment.dispose();sun.shadow.dispose();bounce.shadow.dispose();renderer.dispose();
    },
  };
}

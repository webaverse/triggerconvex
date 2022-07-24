import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useFrame, useCleanup, usePhysics, useApp, useLocalPlayer} = metaversefile;

export default () => {
  const app = useApp();
  const physics = usePhysics();

  const geometry = new THREE.ConeGeometry( 5, 10, 3 );
  const material = new THREE.MeshStandardMaterial( {color: 'gray'} );
  const physicsConvex = new THREE.Mesh( geometry, material );
  app.add( physicsConvex );

  const dynamic = false;
  const physicsObject = physics.addConvexGeometry(physicsConvex, dynamic);
  const result = physics.setTrigger(physicsObject.physicsId);

  const localPlayer = useLocalPlayer();
  app.addEventListener('triggerin', event => {
    console.log('repo: triggerin: ', event.oppositePhysicsId);
    if (localPlayer.characterController && event.oppositePhysicsId === localPlayer.characterController.physicsId) {
      physicsConvex.material.color.set('cyan');
    }
  });
  app.addEventListener('triggerout', event => {
    console.log('repo: triggerout: ', event.oppositePhysicsId);
    if (localPlayer.characterController && event.oppositePhysicsId === localPlayer.characterController.physicsId) {
      physicsConvex.material.color.set('gray');
    }
  });

  useFrame(({timestamp}) => {
    if (dynamic) {
      physicsConvex.position.copy(physicsObject.position).sub(app.position);
      physicsConvex.quaternion.copy(physicsObject.quaternion);
      physicsConvex.updateMatrixWorld();
    }
  });
  
  useCleanup(() => {
    physics.removeGeometry(physicsObject);
  });
  
  return app;
};

/* console_test
  metaversefileApi.getPairByPhysicsId(1)

  rootScene.traverse(child=>{
    if(child.contentId?.includes('physicsconvex')) {
  console.log(child)
  window.physicsconvexApp=child
    }
  })

  physicsconvex.children[0].visible=false

  metaversefileApi.getPairByPhysicsId(1)[1] === physicsconvex
  false

  metaversefileApi.getPairByPhysicsId(1)[1] === physicsconvex.physicsObjects[0]
  true

  physicsconvex.physicsObjects[0].physicsMesh === physicsconvex.children[0]
  false

  metaversefileApi.getPairByPhysicsId(1)[0] === physicsconvex
  true

  physicsManager.getScene().setVelocity(physicsconvexApp.physicsObjects[0],new THREE.Vector3(0,15,0),true)
  physicsManager.getScene().setAngularVelocity(physicsconvexApp.physicsObjects[0],new THREE.Vector3(1,2,3),true)
*/
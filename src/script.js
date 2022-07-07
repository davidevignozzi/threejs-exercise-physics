import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import CANNON from 'cannon' ;

/**
 * Debug
 */
const gui = new dat.GUI()

const debugObject = {};
debugObject.createSphere = () => {
    createSphere(
        Math.random() * 0.5, 
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() * 0.5) * 3
        }
    )
};
gui.add(debugObject, 'createSphere').name('Create a Sphere');

debugObject.createBox = () => {
    createBox(
        Math.random(), 
        Math.random(), 
        Math.random(), 
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() * 0.5) * 3
        }
    )
};
gui.add(debugObject, 'createBox').name('Create a Box');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */
// World
 const world = new CANNON.World();
 world.gravity.set(0, - 9.82, 0); // - 9.82 as the value because it's the gravity constant on earth

 // Materials
 const defaultMaterial = new CANNON.Material('default');
//  const concreteMaterial = new CANNON.Material('concrete');
//  const plasticMaterial = new CANNON.Material('plastic');

//  const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    const defaultContactMaterial = new CANNON.ContactMaterial(
    // concreteMaterial, // Material 1
    // plasticMaterial, // Material 2

    defaultMaterial,
    defaultMaterial,
    {
        // What appen when materials collide
        friction: 0.1,
        restitution: 0.7
    }
);
// world.addContactMaterial(concretePlasticContactMaterial);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial

/* 
 // Sphere
 const sphereShape = new CANNON.Sphere(0.5);
 const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: sphereShape,
    // material: plasticMaterial
});
sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0));
world.addBody(sphereBody);
*/

// Plane
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
// floorBody.material = concreteMaterial;
floorBody.mass = 0;
floorBody.addShape(floorShape);
world.addBody(floorBody);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5);


/**
 * Test sphere
 */
/* 
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
sphere.castShadow = true
sphere.position.y = 0.5
scene.add(sphere)
 */

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 */
const objectToUpdate = [];

// *** Function that create a sphere in Three.js and in the physics world
// Sphere
const spehreGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
});
const createSphere = (radius, position) =>{
    // Three.js mesh
    const mesh = new THREE.Mesh(spehreGeometry, sphereMaterial);
    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    // Cannon.js body
    const shape = new CANNON.Sphere(radius);

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    world.addBody(body);

    // save in objectToUpdate
    objectToUpdate.push({
        mesh: mesh,
        body: body
    });
}
createSphere(0.5, { x: 0, y: 3, z: 0 });

// *** Function that create a box in Three.js and in the physics world
// Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
});
const createBox = (width, height, depth, position) =>{
    // Three.js mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    world.addBody(body);

    // save in objectToUpdate
    objectToUpdate.push({
        mesh: mesh,
        body: body
    });
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Update physics world
    // ? Wind
    // sphereBody.applyForce(new CANNON.Vec3(- 0.5, 0, 0), sphereBody.position)

    world.step(1 / 60, deltaTime, 3);
    /*
        world.step(
            fixed time stamp,
            How much time passed since the last step,
            How much iterations the world can applay to catch up with a potential delay
        )
    */
    // sphere.position.copy(sphereBody.position);

    for(const object of objectToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
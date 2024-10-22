/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function Screen(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/screen.glb");
  const { actions } = useAnimations(animations, group);

  // Play all animations
  useEffect(() => {
    for (const action of Object.values(actions)) {
      action.play();
    }
  }, []);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="link" rotation={[-Math.PI / 2, 0, 0]} scale={0.011}>
          <group
            name="e11b39337a374cf7a74e14c7c02ed8ddfbx"
            rotation={[Math.PI / 2, 0, 0]}
          >
            <group name="RootNode">
              <group
                name="control_box"
                position={[640.338, -776.257, -480.922]}
                scale={[59.66, 33.597, 59.66]}
              />
              <group
                name="power_cable"
                position={[57.838, -285.208, 3.284]}
                rotation={[Math.PI / 2, -0.011, Math.PI]}
                scale={2.317}
              >
                <mesh
                  name="power_cable_Material_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.power_cable_Material_0.geometry}
                  material={materials["Cylinder.001_0.001"]}
                  position={[16.692, 10.106, 11.514]}
                  scale={[4.377, 4.376, 1.185]}
                />
              </group>
              <group name="screen001" scale={[794.163, 400.025, 100]} />
              <group
                name="tx_cable"
                position={[80.914, -285.452, 3.284]}
                rotation={[Math.PI / 2, -0.011, Math.PI]}
                scale={2.317}
              >
                <mesh
                  name="tx_cable_Material_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.tx_cable_Material_0.geometry}
                  material={materials["Cylinder.001_0.001"]}
                  position={[-16.932, 10.106, 11.178]}
                  scale={[4.377, 4.376, 1.185]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="drone"
          position={[-0.391, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={84.757}
        >
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group
                name="pcb_Default_sldprt_9"
                position={[0.014, 0, 0.001]}
                scale={0.001}
              >
                <group
                  name="7mm_motor_mount_Default_sldprt_0"
                  position={[-33.717, 3.792, -33.711]}
                  rotation={[1.564, 0, 0]}
                >
                  <mesh
                    name="Object_6"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_6.geometry}
                    material={materials["Material.007"]}
                  />
                </group>
                <group
                  name="7x15_motor_Default_sldprt_1"
                  position={[-33.849, -4.252, -33.742]}
                  rotation={[1.564, 0, 0]}
                >
                  <mesh
                    name="Object_8"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_8.geometry}
                    material={materials["Material.015"]}
                  />
                </group>
                <group
                  name="battery_bc-bl-01-a_Default_sldprt_2"
                  position={[-11.273, 2.536, 8.16]}
                  rotation={[1.564, 0, 0]}
                >
                  <mesh
                    name="Object_10"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_10.geometry}
                    material={materials["Material.016"]}
                  />
                </group>
                <group
                  name="battery_holder_board_Default_sldprt_3"
                  position={[-10.37, 9.902, 13.127]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[1, 0.972, 1]}
                >
                  <mesh
                    name="Object_12"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_12.geometry}
                    material={materials["Material.017"]}
                  />
                </group>
                <group
                  name="header_Default_sldprt_4"
                  position={[-9.325, 4.28, -8.95]}
                  rotation={[1.564, 0, -Math.PI]}
                  scale={-1}
                >
                  <mesh
                    name="Object_14"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_14.geometry}
                    material={materials["Material.018"]}
                  />
                </group>
                <mesh
                  name="Object_4"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_4.geometry}
                  material={materials["Material.017"]}
                />
                <group
                  name="propeller_ccw_Default_sldprt001_5"
                  position={[33.943, 15.203, 33.846]}
                  rotation={[1.56, -0.005, 0.785]}
                  scale={[1.003, 1, 1]}
                >
                  <mesh
                    name="Object_16"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_16.geometry}
                    material={materials["Material.019"]}
                  />
                </group>
                <group
                  name="propeller_ccw_Default_sldprt002_6"
                  position={[33.943, 15.203, -33.846]}
                  rotation={[-1.563, 0.008, 0.785]}
                  scale={[-1.003, -1, -1]}
                >
                  <mesh
                    name="Object_18"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_18.geometry}
                    material={materials["Material.020"]}
                  />
                </group>
                <group
                  name="propeller_ccw_Default_sldprt003_7"
                  position={[-33.835, 15.203, 33.321]}
                  rotation={[-1.563, 0.008, 0.785]}
                  scale={[-1.003, -1, -1]}
                >
                  <mesh
                    name="Object_20"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_20.geometry}
                    material={materials["Material.019"]}
                  />
                </group>
                <group
                  name="propeller_ccw_Default_sldprt004_8"
                  position={[-33.943, 15.203, -33.846]}
                  rotation={[1.572, 0.001, Math.PI / 4]}
                  scale={[1.003, 1, 1]}
                >
                  <mesh
                    name="Object_22"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_22.geometry}
                    material={materials["Material.019"]}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <group name="screen" rotation={[-Math.PI / 2, 0, 0]} scale={33.968}>
          <group
            name="c4553b6c8ec14db1a8bb5b86e698445bfbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}
          >
            <group name="RootNode001">
              <group
                name="Display"
                position={[0.778, 15.88, -0.332]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={58.374}
              >
                <mesh
                  name="display"
                  castShadow
                  receiveShadow
                  geometry={nodes.display.geometry}
                  material={materials.Display}
                  position={[0, -0.026, -0.675]}
                />
              </group>
              <group
                name="Main"
                position={[-22.555, 0.535, 0.546]}
                rotation={[0, 0, 2.714]}
                scale={58.725}
              >
                <mesh
                  name="Main_Body_0"
                  castShadow
                  receiveShadow
                  geometry={nodes.Main_Body_0.geometry}
                  material={materials["Body.001"]}
                  position={[-0.278, 0.611, 0.026]}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/screen.glb");
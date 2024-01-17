import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

// Local imports
import useStore from '../store/store.js'

export default function Robot(props) {
    //
    // Global state
    //
    const robotAnimation = useStore(state => state.robotAnimation);

    const robot = useGLTF('./robot.glb')
    const animations = useAnimations(robot.animations, robot.scene)

    useEffect(() => {
        const action = animations.actions[robotAnimation]
        action
            .reset()
            .fadeIn(0.5)
            .play()

        return () => {
            action.fadeOut(0.5)
        }
    }, [robotAnimation])

    return <primitive
        {...props}
        scale={[0.3, 0.3, 0.3]}
        rotation={[0, Math.PI, 0]}
        position={[-0.5, 0, 1]}
        object={robot.scene}
    />
}
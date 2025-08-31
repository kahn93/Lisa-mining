"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Box, Sphere, Cone } from "@react-three/drei"
import type * as THREE from "three"

interface AdventureSceneProps {
  questLocation: string
}

export function AdventureScene({ questLocation }: AdventureSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const angelRef = useRef<THREE.Mesh>(null)

  useFrame((state: { clock: { elapsedTime: number } }) => {
    if (angelRef.current) {
      angelRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
      angelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const getSceneElements = () => {
    switch (questLocation) {
      case "Mystic Forest":
        return (
          <>
            {/* Trees */}
            <Cone args={[0.5, 2]} position={[-3, 1, -2]} material-color="#2d5016" />
            <Cone args={[0.4, 1.8]} position={[-3, 1.8, -2]} material-color="#4a7c59" />
            <Cone args={[0.6, 2.2]} position={[3, 1.1, -1]} material-color="#2d5016" />
            <Cone args={[0.5, 2]} position={[3, 2.1, -1]} material-color="#4a7c59" />

            {/* Ground */}
            <Box args={[10, 0.1, 10]} position={[0, -0.05, 0]} material-color="#3a5f3a" />

            {/* Mystical particles */}
            <Sphere args={[0.05]} position={[-2, 2, 1]} material-color="#10b981" />
            <Sphere args={[0.05]} position={[1, 2.5, -1]} material-color="#10b981" />
            <Sphere args={[0.05]} position={[2, 1.8, 2]} material-color="#10b981" />
          </>
        )
      case "Temple of Light":
        return (
          <>
            {/* Temple structure */}
            <Box args={[4, 3, 2]} position={[0, 1.5, -3]} material-color="#8b7355" />
            <Box args={[0.3, 3, 0.3]} position={[-1.5, 1.5, -2]} material-color="#d4af37" />
            <Box args={[0.3, 3, 0.3]} position={[1.5, 1.5, -2]} material-color="#d4af37" />

            {/* Ground */}
            <Box args={[10, 0.1, 10]} position={[0, -0.05, 0]} material-color="#c4a484" />

            {/* Light beams */}
            <Sphere args={[0.1]} position={[0, 4, -3]} material-color="#ffd700" />
          </>
        )
      case "Tower of Shadows":
        return (
          <>
            {/* Dark tower */}
            <Box args={[1.5, 6, 1.5]} position={[0, 3, -4]} material-color="#2c1810" />
            <Cone args={[1, 1.5]} position={[0, 6.75, -4]} material-color="#1a0f08" />

            {/* Ground */}
            <Box args={[10, 0.1, 10]} position={[0, -0.05, 0]} material-color="#4a4a4a" />

            {/* Dark energy */}
            <Sphere args={[0.08]} position={[-1, 3, -2]} material-color="#8b0000" />
            <Sphere args={[0.08]} position={[1, 2, -1]} material-color="#8b0000" />
          </>
        )
      case "Gates of Hell":
        return (
          <>
            {/* Hell gates */}
            <Box args={[0.5, 5, 0.5]} position={[-2, 2.5, -4]} material-color="#8b0000" />
            <Box args={[0.5, 5, 0.5]} position={[2, 2.5, -4]} material-color="#8b0000" />
            <Box args={[4, 0.5, 0.5]} position={[0, 4.75, -4]} material-color="#8b0000" />

            {/* Ground */}
            <Box args={[10, 0.1, 10]} position={[0, -0.05, 0]} material-color="#2c0000" />

            {/* Flames */}
            <Sphere args={[0.1]} position={[-2, 1, -3]} material-color="#ff4500" />
            <Sphere args={[0.1]} position={[2, 1, -3]} material-color="#ff4500" />
            <Sphere args={[0.1]} position={[0, 1, -2]} material-color="#ff4500" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <group ref={groupRef}>
      {/* Scene elements based on location */}
      {getSceneElements()}

      {/* Guardian Angel Lisa */}
      <group ref={angelRef} position={[0, 1, 0]}>
        {/* Angel body */}
        <Sphere args={[0.3]} position={[0, 0, 0]} material-color="#f8f8ff" />

        {/* Wings */}
        <Box args={[0.8, 0.1, 0.3]} position={[-0.4, 0.2, -0.1]} material-color="#ffffff" rotation={[0, 0, 0.3]} />
        <Box args={[0.8, 0.1, 0.3]} position={[0.4, 0.2, -0.1]} material-color="#ffffff" rotation={[0, 0, -0.3]} />

        {/* Halo */}
        <Sphere args={[0.4, 8, 8]} position={[0, 0.6, 0]} material-color="#ffd700" material-wireframe />

        {/* Sword */}
        <Box args={[0.05, 0.8, 0.05]} position={[0.3, -0.2, 0]} material-color="#c0c0c0" />
        <Box args={[0.15, 0.05, 0.05]} position={[0.3, 0.2, 0]} material-color="#d4af37" />
      </group>

      {/* Location text */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter_Bold.json"
      >
        {questLocation}
      </Text>

      {/* Ambient lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#10b981" />
    </group>
  )
}

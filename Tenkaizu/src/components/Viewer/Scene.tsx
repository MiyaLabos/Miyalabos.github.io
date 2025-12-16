import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Center } from '@react-three/drei';
import type { Point } from '../../types';
import { NetMesh } from './NetMesh';

interface SceneProps {
    squares: Point[];
    foldProgress: number; // 0 to 1
}

export const Scene: React.FC<SceneProps> = ({ squares, foldProgress }) => {
    return (
        <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 6, 4]} fov={50} />
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

                <Center>
                    <NetMesh squares={squares} foldProgress={foldProgress} />
                </Center>

                <gridHelper args={[20, 20, 0x444444, 0x222222]} />
            </Canvas>
        </div>
    );
};

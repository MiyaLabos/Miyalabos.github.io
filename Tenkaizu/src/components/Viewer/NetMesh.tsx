import React, { useMemo } from 'react';
import type { Point } from '../../types';
import { buildFoldingTree } from '../../logic/folding';
import type { BoxNode } from '../../logic/folding';
import * as THREE from 'three';

interface NetMeshProps {
    squares: Point[];
    foldProgress: number; // 0..1
}

export const NetMesh: React.FC<NetMeshProps> = ({ squares, foldProgress }) => {
    const tree = useMemo(() => buildFoldingTree(squares), [squares]);

    if (!tree) return null;

    // Center the root
    return (
        <group>
            <RecursiveFace node={tree} foldProgress={foldProgress} isRoot={true} />
        </group>
    );
};

const RecursiveFace: React.FC<{ node: BoxNode; foldProgress: number; isRoot?: boolean }> = ({ node, foldProgress }) => {
    // If isRoot, we just place it at (0,0,0) (or centered if we want)
    // If not root, we wrap in a Group that handles the rotation relative to parent pivot.

    const inner = (
        <group>
            {/* Visual Face */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.95, 0.05, 0.95]} /> {/* Thin box as face */}
                <meshStandardMaterial color="#6366f1" />
            </mesh>

            {/* Outline */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(0.95, 0.05, 0.95)]} />
                <lineBasicMaterial color="white" />
            </lineSegments>

            {/* Children */}
            {node.children.map(child => (
                <ChildFaceWrapper key={child.id} node={child} foldProgress={foldProgress} />
            ))}
        </group>
    );

    return inner;
};

const ChildFaceWrapper: React.FC<{ node: BoxNode; foldProgress: number }> = ({ node, foldProgress }) => {
    const dir = node.directionFromParent;

    // Calculate pivot and rotation axis based on direction
    // Size of square = 1.
    // 
    // Visualization coordinates:
    // Root at (0,0,0).
    // Face lies in XZ plane (y=0 is thickness).
    // RIGHT (x+1) -> Pivot at x=0.5. Rotate around Z axis?
    // LEFT (x-1) -> Pivot at x=-0.5.
    // DOWN (y+1) -> Pivot at z=0.5.
    // UP (y-1) -> Pivot at z=-0.5.

    // Rotation:
    // We want to fold "Up" (walls of box). 90 deg.
    // Axis of rotation lies on the edge.

    // Pivot offsets relative to center of PARENT
    // And the CHILD needs to be shifted so its edge matches the pivot.
    // Group structure: Parent -> PivotGroup -> ChildContent

    // Actually simpler:
    // Group at Pivot Position (relative to parent center).
    // Inside Group: Rotate.
    // Inside Rotate: Translate Child Center so its edge touches pivot.

    // Dimensions 1x1.
    // RIGHT neighbor:
    // Pivot at Parent's (0.5, 0, 0).
    // Child's Center should be at (+0.5, 0, 0) relative to Pivot IF FLAT.
    // So total offset from Parent Center = (1, 0, 0) IF FLAT.

    // Animation:
    // Rotate around Pivot.

    // Configs:
    let pivotPos: [number, number, number] = [0, 0, 0];
    let rotationAxisVec = new THREE.Vector3(0, 0, 0);
    let childShift: [number, number, number] = [0, 0, 0];

    // We want all faces to fold "Up" (Valley fold) to form the box.
    // Axis determination:
    // RIGHT (x+1): Pivot at (0.5, 0, 0).
    //   We want child (initially at flat 1.0) to rotate UP towards +Y.
    //   Child is at +X relative to pivot.
    //   Rotate around Z-axis (0,0,1).
    //   +90 deg around Z: X -> Y.
    //   So Axis (0,0,1).

    // LEFT (x-1): Pivot at (-0.5, 0, 0).
    //   Child is at -X relative to pivot.
    //   We want it to go UP (+Y).
    //   Rotate around Z-axis?
    //   +90 deg Z: -X -> -Y (Down). No.
    //   -90 deg Z: -X -> Y.
    //   So Axis (0,0,1) with -90? Or Axis (0,0,-1) with +90?
    //   Let's stick to Positive Angle * Axis.
    //   Axis (0,0,-1) -> Right Hand Rule: Thumb into screen. Fingers curl Clockwise (if looking from front).
    //   -X moves to +Y. Yes.
    //   So Axis (0,0,-1).

    // DOWN (y+1): Pivot at (0, 0, 0.5) (Grid Y is View Z).
    //   Grid Y+ maps to Three Z+.
    //   Child at +Z relative to pivot.
    //   Want to go UP (+Y).
    //   Rotate around X-axis.
    //   +90 X: +Z -> -Y. No.
    //   -90 X: +Z -> +Y.
    //   So Axis (-1, 0, 0).

    // UP (y-1): Pivot at (0, 0, -0.5).
    //   Child at -Z relative to pivot.
    //   Want to go UP (+Y).
    //   +90 X: -Z -> Y.
    //   So Axis (1, 0, 0).

    switch (dir) {
        case 'RIGHT': // x+1
            pivotPos = [0.5, 0, 0];
            rotationAxisVec.set(0, 0, 1);
            childShift = [0.5, 0, 0];
            break;
        case 'LEFT': // x-1
            pivotPos = [-0.5, 0, 0];
            rotationAxisVec.set(0, 0, -1);
            childShift = [-0.5, 0, 0];
            break;
        case 'DOWN': // y+1 -> z+1
            pivotPos = [0, 0, 0.5];
            rotationAxisVec.set(-1, 0, 0);
            childShift = [0, 0, 0.5];
            break;
        case 'UP': // y-1 -> z-1
            pivotPos = [0, 0, -0.5];
            rotationAxisVec.set(1, 0, 0);
            childShift = [0, 0, -0.5];
            break;
    }

    // Rotation Angle
    const angle = foldProgress * (Math.PI / 2); // 90 degrees

    const rotationEuler: [number, number, number] = [
        rotationAxisVec.x * angle,
        rotationAxisVec.y * angle,
        rotationAxisVec.z * angle
    ];

    return (
        <group position={pivotPos} rotation={rotationEuler}>
            <group position={childShift}>
                <RecursiveFace node={node} foldProgress={foldProgress} isRoot={false} />
            </group>
        </group>
    );
};

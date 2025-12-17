import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class NetVisualizer {
    constructor(container) {
        this.container = container;
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0, 10);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        this.setupLights();

        // Group to hold the entire net, centered
        this.netGroup = new THREE.Group();
        this.scene.add(this.netGroup);

        this.pivots = []; // Store references to pivots for animation

        window.addEventListener('resize', () => this.onResize());
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-5, -5, -5);
        this.scene.add(backLight);
    }

    onResize() {
        if (!this.container) return;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    createFaceMesh(r, c) {
        // Create a nice box for the face
        const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            roughness: 0.4,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Add white edges
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
        mesh.add(line);

        mesh.userData = { r, c };
        return mesh;
    }

    updateNet(grid) {
        // Clear previous
        this.netGroup.clear();
        this.pivots = [];

        const rows = grid.length;
        const cols = grid[0].length;
        const visited = new Set();

        // Find first active cell to be root
        let startNode = null;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 1) {
                    startNode = { r, c };
                    break;
                }
            }
            if (startNode) break;
        }

        if (!startNode) return;

        // BFS to build hierarchy
        // Queue items: { r, c, parentObj }
        // For Root: parentObj is netGroup

        // BUT: For root, we just add it to netGroup.
        // For subsequent, we add to the Parent Mesh via a Pivot.

        // Actually, we must place the ROOT such that the whole net is roughly centered?
        // Let's just place Root at (0,0,0) of netGroup. 
        // We can center netGroup later if needed (bounding box).

        const rootMesh = this.createFaceMesh(startNode.r, startNode.c);
        this.netGroup.add(rootMesh);

        const queue = [{ r: startNode.r, c: startNode.c, parentMesh: rootMesh }];
        visited.add(`${startNode.r},${startNode.c}`);

        while (queue.length > 0) {
            const { r, c, parentMesh } = queue.shift();

            const neighbors = [
                { dr: -1, dc: 0, dir: 'UP' },   // Grid Up (screen up) -> Y+
                { dr: 1, dc: 0, dir: 'DOWN' },  // Grid Down (screen down) -> Y-
                { dr: 0, dc: -1, dir: 'LEFT' }, // Grid Left -> X-
                { dr: 0, dc: 1, dir: 'RIGHT' }  // Grid Right -> X+
            ];

            for (const n of neighbors) {
                const nr = r + n.dr;
                const nc = c + n.dc;

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
                    if (!visited.has(`${nr},${nc}`)) {
                        visited.add(`${nr},${nc}`);

                        // Create Pivot Group attached to Parent Mesh
                        const pivot = new THREE.Group();
                        parentMesh.add(pivot);

                        // Position pivot at the shared edge
                        // Coordinate system: X Right, Y Up (in 3D, matches Grid visual if we map Grid Y to -3D Y)
                        // Wait, let's map Grid Y (down) to 3D Y (up) to simplify? 
                        // Or just standard: Grid (0,0) is top-left.
                        // Let's stick to: visualizer matches grid layout locally.
                        // Up in Grid (r-1) is Up in 3D (y+1).
                        // Down in Grid (r+1) is Down in 3D (y-1).

                        let pivotPos = new THREE.Vector3();
                        let childPos = new THREE.Vector3();
                        let axis = new THREE.Vector3();
                        let angle = 0; // Target angle (90 deg usually)

                        // Relative to Parent Center (0,0,0)
                        switch (n.dir) {
                            case 'UP': // Parent's Top Edge
                                pivotPos.set(0, 0.5, 0);
                                childPos.set(0, 0.5, 0); // Child center relative to pivot
                                axis.set(1, 0, 0); // X axis
                                angle = -Math.PI / 2; // Fold 'Back' (-Z)
                                break;
                            case 'DOWN': // Parent's Bottom Edge
                                pivotPos.set(0, -0.5, 0);
                                childPos.set(0, -0.5, 0);
                                axis.set(1, 0, 0);
                                angle = Math.PI / 2; // Fold 'Back' (-Z)
                                break;
                            case 'LEFT': // Parent's Left Edge
                                pivotPos.set(-0.5, 0, 0);
                                childPos.set(-0.5, 0, 0);
                                axis.set(0, 1, 0); // Y axis
                                angle = -Math.PI / 2;
                                break;
                            case 'RIGHT': // Parent's Right Edge
                                pivotPos.set(0.5, 0, 0);
                                childPos.set(0.5, 0, 0);
                                axis.set(0, 1, 0); // Y axis
                                angle = Math.PI / 2; // Rotate around +Y: +X -> -Z which is correct? 
                                // +X -> -Z is Right -> Back. Yes.
                                break;
                        }

                        pivot.position.copy(pivotPos);

                        const childMesh = this.createFaceMesh(nr, nc);
                        childMesh.position.copy(childPos);
                        pivot.add(childMesh);

                        // Save pivot info for animation
                        this.pivots.push({
                            obj: pivot,
                            axis: axis,
                            targetAngle: angle
                        });

                        queue.push({ r: nr, c: nc, parentMesh: childMesh });
                    }
                }
            }
        }
    }

    setFoldAngle(t) {
        // t is 0..1
        // Fold angle goes from 0 (flat) to Target (90 deg usually)
        for (const p of this.pivots) {
            // Apply rotation
            // Cleanest way: set quaternion from axis-angle
            p.obj.quaternion.setFromAxisAngle(p.axis, p.targetAngle * t);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

import { Camera, Vector3, Group } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DeviceOrientationListener } from './deviceOrientation';
import gsap from 'gsap';

interface GyroscopeControlsParameters {
    duration: number
}

export class GyroscopeControls extends OrbitControls {
    private cameraGroup: Group = new Group();

    public constructor(public camera: Camera, domElement: HTMLElement, private parameters?: GyroscopeControlsParameters) {
        super(camera, domElement);
        camera.parent?.add(this.cameraGroup);
        this.cameraGroup.add(camera);
        DeviceOrientationListener.subscribe(this.onDeviceOrientationChangeEvent.bind(this));
    }

    public deAttach(): void {
        DeviceOrientationListener.unsubscribe();
        super.dispose?.call(null);
    }

    private onDeviceOrientationChangeEvent(currentAngle: Vector3): void {
        gsap.to(this.cameraGroup.rotation, {
            y: currentAngle.z,
            duration: this.parameters?.duration ?? 0.25,
        });
        gsap.to(this.camera.rotation, {
            x: currentAngle.y,
            z: currentAngle.x,
            duration: this.parameters?.duration ?? 0.25,
        });
    }
}

export function requestPermission(): Promise<{response: string}> {
    // @ts-ignore
    if(!window.DeviceOrientationEvent?.requestPermission || typeof window.DeviceOrientationEvent?.requestPermission !== 'function') return;
    // @ts-ignore
    return window.DeviceOrientationEvent?.requestPermission()
}
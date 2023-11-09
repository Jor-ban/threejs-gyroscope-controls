import { Euler, MathUtils, Quaternion, Vector3 } from 'three';

declare global {
    interface DeviceOrientationEvent {
        webkitCompassHeading: number | undefined;
    }
}

class DeviceOrientationListenerFactory {
    private isIOS = [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document
    
    private listener: ((e: Event) => void) | null = null
    
    public subscribe(callBack: (currentAngle: Vector3) => void): void {
        this.listener = (event: Event) => {
            const deviceOrientation = event as DeviceOrientationEvent;
            // Z
            const alpha = deviceOrientation.alpha ? 
                MathUtils.degToRad(
                    this.isIOS && deviceOrientation.webkitCompassHeading && deviceOrientation.alpha ? 
                    deviceOrientation.alpha - deviceOrientation.webkitCompassHeading: 
                    deviceOrientation.alpha
                ) : 
                0;
            // X'
            const beta = deviceOrientation.beta ? MathUtils.degToRad(deviceOrientation.beta) : 0;
            // Y''
            const gamma = deviceOrientation.gamma ? MathUtils.degToRad(deviceOrientation.gamma) : 0;
            // O
            const orient = 0 ? MathUtils.degToRad(0) : 0;
    
            const currentQ = new Quaternion();
    
            this.setObjectQuaternion()(currentQ, alpha, beta, gamma, orient);
    
            callBack(this.Quat2Angle(currentQ.x, currentQ.y, currentQ.z, currentQ.w));
        }
        document.addEventListener(this.isIOS ? 'deviceorientation' : 'deviceorientationabsolute', this.listener.bind(this))
    }
    
    public unsubscribe(): void {
        if (!this.listener) return;
        document.removeEventListener('deviceorientation', this.listener);
    }
    
    private setObjectQuaternion(): (
        quaternion: Quaternion,
        alpha: number,
        beta: number,
        gamma: number,
        orient: number
    ) => void {
        const zee = new Vector3(0, 0, 1);
        const euler = new Euler();
        const q0 = new Quaternion();
        const q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    
        return function (
            quaternion: Quaternion,
            alpha: number,
            beta: number,
            gamma: number,
            orient: number
        ) {
            // 'ZXY' for the device, but 'YXZ' for us
            euler.set(beta, alpha, -gamma, 'YXZ');
            // Orient the device
            quaternion.setFromEuler(euler);
            // camera looks out the back of the device, not the top
            quaternion.multiply(q1);
            // adjust for screen orientation
            quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
        };
    }
    
    private Quat2Angle(x: number, y: number, z: number, w: number): Vector3 {
        let pitch, roll, yaw;
        const test = x * y + z * w;
    
        // singularity at north pole
        if (test > 0.499) {
            yaw = Math.atan2(x, w) * 2;
            pitch = Math.PI / 2;
            roll = 0;
    
            return new Vector3(pitch, roll, yaw);
        }
    
        // singularity at south pole
        if (test < -0.499) {
            yaw = -2 * Math.atan2(x, w);
            pitch = -Math.PI / 2;
            roll = 0;
    
            return new Vector3(pitch, roll, yaw);
        }
    
        const sqx = x * x;
        const sqy = y * y;
        const sqz = z * z;
        yaw = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
        pitch = Math.asin(2 * test);
        roll = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);
    
        return new Vector3(pitch, roll, yaw);
    }
}

export const DeviceOrientationListener = new DeviceOrientationListenerFactory();
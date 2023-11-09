<img src="https://www.w3.org/TR/orientation-event/a-rotation.png" />
<h1>How to use</h1>
<code>

    import { GyroscopeControls } from 'threejs-gyroscope-controls';

    const orbitControls = new GyroscopeControls(camera, renderer.domElement);

</code>
<h3>If you want to have ios support, call this code before initializing GyroscopeControls (it must be called by click event)</h3>
<code>

    import { requestPermission } from 'threejs-gyroscope-controls';

    window.addEventListener('click', () => {
        requestPermission().catch(() => console.error('Permission denied'))
    })

</code>
<p>Good luck :)</p>
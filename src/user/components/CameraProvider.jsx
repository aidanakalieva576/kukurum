import { useEffect } from 'react';

const CameraProvider = () => {
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.setAttribute('id', 'user-video');
        video.style.display = 'none';
        video.autoplay = true;
        video.srcObject = stream;
        document.body.appendChild(video);
      } catch (err) {
        console.error('Ошибка доступа к камере:', err);
      }
    }

    setupCamera();
  }, []);

  return null;
};

export default CameraProvider;
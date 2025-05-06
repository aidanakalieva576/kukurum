import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';


export default function EmotionDetector({ onEmotionDetected }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error('Ошибка камеры', err));
    };

    loadModels().then(startVideo);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current && faceapi.nets.faceExpressionNet.params) {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections && detections.expressions) {
          const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
          const topEmotion = sorted[0][0];
          onEmotionDetected(topEmotion);
        }
      }
    }, 2000); 

    return () => clearInterval(interval);
  }, [onEmotionDetected]);

  return (
    <video ref={videoRef} autoPlay muted width="200" height="150" style={{ display: 'none' }} />
  );
}
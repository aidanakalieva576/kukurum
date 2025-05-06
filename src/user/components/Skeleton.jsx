import React, { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { assets } from '../assets/assets';

const SkeletonAssistant = () => {
  const [emotion, setEmotion] = useState('');

  useEffect(() => {
    const runEmotionRecognition = async () => {
      const video = document.getElementById('user-video');
      if (!video) return;

      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');

      const detect = async () => {
        if (!video.paused && !video.ended) {
          const result = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (result && result.expressions) {
            const detectedEmotion = Object.entries(result.expressions).sort((a, b) => b[1] - a[1])[0][0];
            setEmotion(detectedEmotion);
          }
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    runEmotionRecognition();
  }, []);
  
  

  const getMessage = () => {
    switch (emotion) {
      case 'happy':
        return 'Вы выглядите радостным! Отличное настроение!';
      case 'sad':
        return 'Вы выглядите грустным... Может, хотите поговорить?';
      case 'angry':
        return 'Вы раздражены? Попробуйте глубоко вдохнуть.';
      case 'surprised':
        return 'Вы чем-то удивлены? Расскажите!';
      case 'fearful':
        return 'Вы выглядите встревоженным. Всё в порядке?';
      case 'disgusted':
        return 'Что-то вызвало отвращение? Я могу помочь.';
      default:
        return 'Привет! Я ваш помощник Chokolol.';
    }
  };


  const getSkeletonImage = () => {
    switch (emotion) {
      case 'happy':
        return assets.scelet2;
      case 'sad':
        return assets.treat;    
      case 'angry':
        return assets.angry;  
      case 'surprised':
        return assets.think; 
      case 'fearful':
        return assets.worry;  
      case 'disgusted':
        return assets.sad; 
      default:
        return assets.happy;  
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'linear-gradient(to bottom right, #ffffff, #e6e6e6)',
        padding: '20px',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        width: '280px',
        maxWidth: '90%',
        fontFamily: 'Arial, sans-serif',
        pointerEvents: 'auto',
        transition: 'all 0.3s ease-in-out',
        display: 'flex',     
        flexDirection: 'column', 
        alignItems: 'center',   
        gap: '10px',         
      }}
    >
      {/* Картинка скелетика */}
      <div style={{ flexShrink: 0 }}>
        <img
          src={getSkeletonImage()}
          alt="Skeleton Assistant"
          style={{ width: '80px', height: 'auto' }} 
        />
      </div>

      {/* Текст */}
      <div style={{ maxWidth: '90%', wordWrap: 'break-word' }}>
        <p style={{ margin: 0, fontSize: '16px', color: '#333' }}>{getMessage()}</p>
      </div>
    </div>
  );
};

export default SkeletonAssistant;

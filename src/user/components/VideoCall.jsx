import { useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';

const VideoCall = () => {
  const callFrame = useRef(null);

  useEffect(() => {

    callFrame.current = DailyIframe.createFrame({
      url: window.location.href, 
      iframeStyle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: 'none',
      },
    });

    return () => {
      if (callFrame.current) {
        callFrame.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <h1>Видеозвонок</h1>
      {/* Здесь будет рендериться видеоконференция */}
    </div>
  );
};

export default VideoCall;

import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedContext } from '../context/UnifiedContext';

const RedirectByRole = () => {
  const navigate = useNavigate();
  const { user } = useContext(UnifiedContext);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'doctor') {
      navigate('/doctor');
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  return null; // Пусто, пока редиректится
};

export default RedirectByRole;

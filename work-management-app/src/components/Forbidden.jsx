import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Forbidden = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={<Button type="primary" className="!bg-blue-600 !text-white hover:!bg-blue-500" onClick={() => navigate('/')}>Back Home</Button>}
      />
    </div>
  );
};

export default Forbidden;

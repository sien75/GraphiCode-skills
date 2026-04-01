import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import StructurePreview from './index';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <StructurePreview />
    </ConfigProvider>
  </React.StrictMode>
);

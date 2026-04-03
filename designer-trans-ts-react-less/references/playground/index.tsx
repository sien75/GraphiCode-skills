import React, { useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

// Import structure components
import LeftSidebarExpanded from './components/left-sidebar-expanded';
import LeftSidebarCollapsed from './components/left-sidebar-collapsed';
import MultiLanguage from './components/multi-language';
import MessageCenter from './components/message-center';
import PersonalCenter from './components/personal-center';
import MessageCenterStoryboard from './components/message-center-storyboard';

// Import styles
import styles from './index.module.less';

const componentsMap: Record<string, React.FC> = {
  'left-sidebar-expanded': LeftSidebarExpanded,
  'left-sidebar-collapsed': LeftSidebarCollapsed,
  'multi-language': MultiLanguage,
  'message-center': MessageCenter,
  'personal-center': PersonalCenter,
  'message-center-storyboard': MessageCenterStoryboard,
};

const componentLabels: Record<string, string> = {
  'left-sidebar-expanded': '左侧边栏展开',
  'left-sidebar-collapsed': '左侧边栏收起',
  'multi-language': '多语言切换',
  'message-center': '消息中心',
  'personal-center': '个人中心',
  'message-center-storyboard': '消息中心交互分镜',
};

const StructurePreview: React.FC = () => {
  const [activeKey, setActiveKey] = useState('left-sidebar-expanded');

  const items: TabsProps['items'] = Object.keys(componentsMap).map((key) => ({
    key,
    label: componentLabels[key] || key,
    children: (
      <div className={styles.previewContainer}>
        {React.createElement(componentsMap[key])}
      </div>
    ),
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Structure 组件预览</h1>
      </div>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={items}
        type="card"
        className={styles.tabs}
      />
    </div>
  );
};

export default StructurePreview;

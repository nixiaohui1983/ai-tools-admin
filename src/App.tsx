import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, Layout, Menu, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import {
  ToolOutlined,
  SolutionOutlined,
  NodeIndexOutlined,
  FileTextOutlined,
  UserOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import Dashboard from "./pages/dashboard";
import ToolList from "./pages/tools/ToolList";
import TaskList from "./pages/tasks/TaskList";
import WorkflowList from "./pages/workflows/WorkflowList";
import ArticleList from "./pages/articles/ArticleList";
import UserList from "./pages/users/UserList";

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "数据看板",
    },
    {
      key: "/tools",
      icon: <ToolOutlined />,
      label: "工具管理",
    },
    {
      key: "/tasks",
      icon: <SolutionOutlined />,
      label: "任务管理",
    },
    {
      key: "/workflows",
      icon: <NodeIndexOutlined />,
      label: "工作流管理",
    },
    {
      key: "/articles",
      icon: <FileTextOutlined />,
      label: "内容管理",
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "用户管理",
    },
  ];

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#6366F1",
        },
      }}
    >
      <BrowserRouter>
        <Layout style={{ minHeight: "100vh" }}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            theme="dark"
          >
            <div className="flex items-center justify-center h-16 border-b border-white/10">
              <div className="text-white font-bold text-lg">
                {collapsed ? "AI" : "AI Stack Hub"}
              </div>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={["/dashboard"]}
              items={menuItems}
              onClick={({ key }) => window.location.href = key}
            />
          </Sider>
          <Layout>
            <Header
              style={{
                background: "#fff",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <h1 className="text-lg font-semibold m-0">AI Stack Hub 管理后台</h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm">管理员</span>
              </div>
            </Header>
            <Content style={{ margin: "16px" }}>
              <div
                style={{
                  padding: 24,
                  background: "#fff",
                  minHeight: "calc(100vh - 112px)",
                  borderRadius: "8px",
                }}
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tools" element={<ToolList />} />
                  <Route path="/tasks" element={<TaskList />} />
                  <Route path="/workflows" element={<WorkflowList />} />
                  <Route path="/articles" element={<ArticleList />} />
                  <Route path="/users" element={<UserList />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

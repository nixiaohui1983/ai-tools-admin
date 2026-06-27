import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, List, Tag, Spin } from "antd";
import {
  ToolOutlined, SolutionOutlined, NodeIndexOutlined, FileTextOutlined,
  UserOutlined, RiseOutlined,
} from "@ant-design/icons";
import { toolsAPI, tasksAPI, workflowsAPI, articlesAPI } from "../../api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTools: 0, totalTasks: 0, totalWorkflows: 0, totalArticles: 0, totalUsers: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [toolsRes, tasksRes, wfRes, artRes] = await Promise.all([
          toolsAPI.list({ limit: 100 }),
          tasksAPI.list(),
          workflowsAPI.list(),
          articlesAPI.list(),
        ]);
        const tools = toolsRes.data.tools || [];
        const recentItems = [
          ...tools.slice(0, 3).map((t: any) => ({ type: "tool", name: t.name, time: t.createdAt })),
          ...(wfRes.data || []).slice(0, 2).map((w: any) => ({ type: "workflow", name: w.name, time: w.createdAt })),
          ...(artRes.data || []).slice(0, 2).map((a: any) => ({ type: "article", name: a.title, time: a.publishedAt || a.createdAt })),
        ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

        setStats({
          totalTools: toolsRes.data.total || 0,
          totalTasks: tasksRes.total || 0,
          totalWorkflows: wfRes.total || 0,
          totalArticles: artRes.total || 0,
          totalUsers: 2,
        });
        setRecent(recentItems);
      } catch { /* show empty */ } finally { setLoading(false); }
    })();
  }, []);

  const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    tool: { icon: <ToolOutlined />, color: "blue", label: "工具" },
    workflow: { icon: <NodeIndexOutlined />, color: "purple", label: "工作流" },
    article: { icon: <FileTextOutlined />, color: "green", label: "文章" },
  };

  return (
    <Spin spinning={loading}>
      <div>
        <h2 className="text-2xl font-bold mb-6">📊 数据看板</h2>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={8} lg={4}>
            <Card><Statistic title="AI 工具" value={stats.totalTools} prefix={<ToolOutlined className="text-indigo-500" />} /></Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card><Statistic title="任务模板" value={stats.totalTasks} prefix={<SolutionOutlined className="text-blue-500" />} /></Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card><Statistic title="工作流" value={stats.totalWorkflows} prefix={<NodeIndexOutlined className="text-purple-500" />} /></Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card><Statistic title="文章" value={stats.totalArticles} prefix={<FileTextOutlined className="text-green-500" />} /></Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card><Statistic title="用户" value={stats.totalUsers} prefix={<UserOutlined className="text-orange-500" />} /></Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card><Statistic title="增长率" value="—" prefix={<RiseOutlined className="text-red-500" />} suffix="本周" /></Card>
          </Col>
        </Row>

        <Card title="📋 最近添加">
          <List
            dataSource={recent}
            renderItem={(item: any) => {
              const cfg = typeConfig[item.type] || typeConfig.tool;
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Tag color={cfg.color}>{cfg.label}</Tag>}
                    title={item.name}
                    description={new Date(item.time).toLocaleDateString()}
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      </div>
    </Spin>
  );
}

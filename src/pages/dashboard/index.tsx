import { useState, useEffect } from "react";
import { Card, Col, Row, Statistic, Table, Tag, Spin, Empty } from "antd";
import {
  ToolOutlined,
  TaskOutlined,
  FlowOutlined,
  FileTextOutlined,
  UserOutlined,
  RiseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toolsAPI, tasksAPI, workflowsAPI, articlesAPI } from "../../api";

interface StatItem {
  key: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  suffix: string;
}

interface ActivityRecord {
  key: string;
  action: string;
  user: string;
  time: string;
  type: "tool" | "task" | "workflow" | "article";
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([
    { key: "tools", label: "工具总数", value: 0, icon: <ToolOutlined />, color: "blue", suffix: "工具" },
    { key: "tasks", label: "任务总数", value: 0, icon: <TaskOutlined />, color: "green", suffix: "任务" },
    { key: "workflows", label: "工作流", value: 0, icon: <FlowOutlined />, color: "purple", suffix: "工作流" },
    { key: "articles", label: "文章", value: 0, icon: <FileTextOutlined />, color: "orange", suffix: "文章" },
    { key: "users", label: "用户", value: 0, icon: <UserOutlined />, color: "cyan", suffix: "用户" },
    { key: "growth", label: "本月新增", value: 0, icon: <RiseOutlined />, color: "red", suffix: "个" },
  ]);
  const [activities, setActivities] = useState<ActivityRecord[]>([
    { key: "1", action: "系统已就绪，等待数据...", user: "系统", time: "—", type: "tool" },
  ]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [toolsRes, tasksRes, workflowsRes, articlesRes] = await Promise.all([
        toolsAPI.list({ limit: 1 }).catch(() => null),
        tasksAPI.list().catch(() => null),
        workflowsAPI.list().catch(() => null),
        articlesAPI.list().catch(() => null),
      ]);

      setStats((prev) =>
        prev.map((s) => {
          if (s.key === "tools") return { ...s, value: toolsRes?.data?.total || 3 };
          if (s.key === "tasks") return { ...s, value: (tasksRes?.data || []).length };
          if (s.key === "workflows") return { ...s, value: (workflowsRes?.data || []).length };
          if (s.key === "articles") return { ...s, value: (articlesRes?.data || []).length };
          return s;
        })
      );

      // Mock recent activities
      setActivities([
        { key: "1", action: "添加了新工具 ChatGPT", user: "管理员", time: "2 分钟前", type: "tool" },
        { key: "2", action: "更新了工作流 SEO Blog Writer", user: "管理员", time: "15 分钟前", type: "workflow" },
        { key: "3", action: "发布了文章 AI Tools Comparison", user: "管理员", time: "1 小时前", type: "article" },
        { key: "4", action: "添加了新任务 YouTube Video Creation", user: "管理员", time: "2 小时前", type: "task" },
      ]);
    } catch {
      // Keep mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const activityColumns: ColumnsType<ActivityRecord> = [
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
    },
    { title: "用户", dataIndex: "user", key: "user", width: 100 },
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 120,
      render: (t) => (
        <span className="flex items-center gap-1">
          <ClockCircleOutlined className="text-gray-400" />
          {t}
        </span>
      ),
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
    cyan: "text-cyan-500",
    red: "text-red-500",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">数据看板</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <Row gutter={[16, 16]} className="mb-8">
            {stats.map((s) => (
              <Col xs={24} sm={12} lg={4} key={s.key}>
                <Card hoverable>
                  <Statistic
                    title={s.label}
                    value={s.value}
                    prefix={<span className={colorMap[s.color] || "text-gray-500"}>{s.icon}</span>}
                    suffix={<Tag color={s.color}>{s.suffix}</Tag>}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Recent Activity */}
          <Card
            title="最近活动"
            className="mb-8"
            extra={
              <Button type="link" size="small" onClick={fetchStats}>
                刷新
              </Button>
            }
          >
            {activities.length === 0 ? (
              <Empty description="暂无活动记录" />
            ) : (
              <Table<ActivityRecord>
                columns={activityColumns}
                dataSource={activities}
                pagination={false}
                size="small"
              />
            )}
          </Card>

          {/* Quick Actions */}
          <Card title="快速操作">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <ToolOutlined />, label: "添加工具", color: "blue", href: "/tools" },
                { icon: <TaskOutlined />, label: "添加任务", color: "green", href: "/tasks" },
                { icon: <FlowOutlined />, label: "创建工作流", color: "purple", href: "/workflows" },
                { icon: <FileTextOutlined />, label: "写文章", color: "orange", href: "/articles" },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className={`p-4 border rounded-lg text-center cursor-pointer hover:border-${action.color}-500 hover:text-${action.color}-500 transition-colors block`}
                >
                  <span className={`text-2xl block mb-2 text-${action.color}-500`}>
                    {action.icon}
                  </span>
                  <span className="text-sm">{action.label}</span>
                </a>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

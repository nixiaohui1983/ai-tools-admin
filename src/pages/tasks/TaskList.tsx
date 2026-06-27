import { useState, useEffect } from "react";
import { Table, Button, Tag, Space, message, Popconfirm, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../../components/PageHeader";
import { tasksAPI, type TaskDTO } from "../../api";

const difficultyColors: Record<string, string> = { easy: "green", medium: "orange", hard: "red" };

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await tasksAPI.list();
      setTasks(res.data.map((t: any) => ({ ...t, key: t.id })));
      setTotal(res.total);
    } catch {
      message.warning("API unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const columns: ColumnsType<any> = [
    { title: "Icon", dataIndex: "icon", key: "icon", width: 60, render: (icon: string) => <span className="text-2xl">{icon || "📋"}</span> },
    {
      title: "Title", dataIndex: "title", key: "title",
      render: (t: string, r: any) => (
        <div><div className="font-semibold">{t}</div><div className="text-xs text-gray-500">{r.description?.slice(0, 80)}</div></div>
      ),
    },
    {
      title: "Difficulty", dataIndex: "difficulty", key: "difficulty", width: 100,
      render: (d: string) => <Tag color={difficultyColors[d] || "default"} className="capitalize">{d}</Tag>,
    },
    { title: "Category", dataIndex: "category", key: "category", width: 110, render: (c: string) => <Tag className="capitalize">{c}</Tag> },
    { title: "Tools", dataIndex: "toolCount", key: "toolCount", width: 70 },
    { title: "Output", dataIndex: "output", key: "output", width: 200, ellipsis: true },
    {
      title: "Actions", key: "actions", width: 120, fixed: "right" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => message.info(`Edit ${record.title}`)} />
          <Popconfirm title="确定删除此任务？" onConfirm={async () => {
            try { await tasksAPI.delete(record.id); message.success("已删除"); loadTasks(); } catch { message.error("删除失败"); }
          }}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="任务管理" description="管理任务模板数据"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => message.info("新增任务")}>新增任务</Button>} />
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={tasks} rowKey="id"
          pagination={{ total, pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
      </Spin>
    </div>
  );
}

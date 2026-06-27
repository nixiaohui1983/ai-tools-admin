import { useState, useEffect } from "react";
import { Table, Button, Tag, Space, message, Popconfirm, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../../components/PageHeader";
import { workflowsAPI, type WorkflowDTO } from "../../api";

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<WorkflowDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const res = await workflowsAPI.list();
      setWorkflows(res.data.map((w: any) => ({ ...w, key: w.id })));
      setTotal(res.total);
    } catch {
      message.warning("API unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkflows(); }, []);

  const columns: ColumnsType<any> = [
    {
      title: "Name", dataIndex: "name", key: "name", width: 200,
      render: (n: string, r: any) => (
        <div><div className="font-semibold">{n}</div><div className="text-xs text-gray-500">{r.description?.slice(0, 60)}</div></div>
      ),
    },
    { title: "Slug", dataIndex: "slug", key: "slug", width: 150, ellipsis: true },
    {
      title: "Template", dataIndex: "isTemplate", key: "isTemplate", width: 80,
      render: (v: boolean) => <Tag color={v ? "blue" : "default"}>{v ? "模板" : "自定义"}</Tag>,
    },
    {
      title: "Featured", dataIndex: "featured", key: "featured", width: 70,
      render: (f: boolean) => f ? "⭐" : "—",
    },
    {
      title: "Steps", key: "steps", width: 200,
      render: (_: any, r: any) => {
        const tools = r.tools || [];
        return (
          <div className="flex items-center gap-1">
            {tools.slice(0, 4).map((wt: any, i: number) => (
              <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{wt.tool?.name || wt.toolId}</span>
            ))}
            {tools.length > 4 && <span className="text-xs text-gray-400">+{tools.length - 4}</span>}
          </div>
        );
      },
    },
    {
      title: "Est. Cost / Time", key: "cost", width: 130,
      render: (_: any, r: any) => (
        <span className="text-xs text-gray-600">
          {r.estimatedCost ? `$${Number(r.estimatedCost).toFixed(0)}` : "—"} / {r.estimatedTime ? `${r.estimatedTime}min` : "—"}
        </span>
      ),
    },
    {
      title: "Actions", key: "actions", width: 120, fixed: "right" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => message.info(`Edit ${record.name}`)} />
          <Popconfirm title="确定删除？" onConfirm={async () => {
            try { await workflowsAPI.delete(record.id); message.success("已删除"); loadWorkflows(); } catch { message.error("删除失败"); }
          }}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="工作流管理" description="管理工作流模板和组合方案"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => message.info("新增工作流")}>新增工作流</Button>} />
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={workflows} rowKey="id"
          pagination={{ total, pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
      </Spin>
    </div>
  );
}

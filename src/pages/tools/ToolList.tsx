import { useState, useEffect } from "react";
import { Table, Button, Tag, Space, Input, Select, message, Popconfirm, Spin } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, StarFilled } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../../components/PageHeader";
import { toolsAPI, type ToolDTO } from "../../api";

const pricingColors: Record<string, string> = {
  free: "green", freemium: "blue", paid: "orange", enterprise: "red",
};

export default function ToolList() {
  const [tools, setTools] = useState<ToolDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [pricingFilter, setPricingFilter] = useState<string | undefined>();

  const loadTools = async () => {
    setLoading(true);
    try {
      const res = await toolsAPI.list({ search: searchText || undefined });
      setTools(res.data.tools.map((t: any) => ({ ...t, key: t.id })));
      setTotal(res.data.total);
    } catch {
      message.warning("API unavailable — showing mock data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTools(); }, []);

  const columns: ColumnsType<any> = [
    {
      title: "Logo", dataIndex: "name", key: "logo", width: 70,
      render: (name: string) => (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow">
          {name?.[0]}
        </div>
      ),
    },
    {
      title: "Name", dataIndex: "name", key: "name", width: 250,
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (name: string, record: any) => (
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{record.description?.slice(0, 60)}...</div>
        </div>
      ),
    },
    {
      title: "Pricing", dataIndex: "pricing", key: "pricing", width: 110,
      filters: [{ text: "Free", value: "free" }, { text: "Freemium", value: "freemium" }, { text: "Paid", value: "paid" }, { text: "Enterprise", value: "enterprise" }],
      onFilter: (value: any, record: any) => record.pricing === value,
      render: (p: string) => <Tag color={pricingColors[p] || "default"} className="capitalize">{p}</Tag>,
    },
    {
      title: "Rating", dataIndex: "rating", key: "rating", width: 90,
      sorter: (a: any, b: any) => (a.rating || 0) - (b.rating || 0),
      render: (r: number) => (
        <span className="flex items-center gap-1">
          <StarFilled className="text-yellow-400 text-xs" />
          <span className="font-medium">{r ? Number(r).toFixed(1) : "—"}</span>
        </span>
      ),
    },
    {
      title: "Categories", dataIndex: "categories", key: "categories", width: 200,
      render: (cats: string[]) => (
        <div className="flex flex-wrap gap-1">
          {cats?.map((c) => <Tag key={c} className="text-xs">{c}</Tag>)}
        </div>
      ),
    },
    {
      title: "Created", dataIndex: "createdAt", key: "createdAt", width: 110,
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Actions", key: "actions", width: 120, fixed: "right" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => message.info(`Edit ${record.name}`)} />
          <Popconfirm title="确定删除此工具？" onConfirm={async () => {
            try { await toolsAPI.delete(record.id); message.success("已删除"); loadTools(); } catch { message.error("删除失败"); }
          }} okText="确认" cancelText="取消">
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dataSource = tools.filter((t: any) => {
    if (searchText && !t.name?.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (pricingFilter && t.pricing !== pricingFilter) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="工具管理" description="管理平台上的所有 AI 工具数据"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => message.info("新增工具")}>新增工具</Button>} />
      <div className="mb-4 flex items-center gap-4">
        <Input placeholder="搜索工具名称..." prefix={<SearchOutlined />} value={searchText}
          onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} allowClear />
        <Select placeholder="筛选定价" value={pricingFilter} onChange={setPricingFilter} allowClear style={{ width: 150 }}
          options={[{ value: "free", label: "Free" }, { value: "freemium", label: "Freemium" }, { value: "paid", label: "Paid" }, { value: "enterprise", label: "Enterprise" }]} />
        <Button onClick={() => loadTools()}>刷新</Button>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={dataSource} rowKey="id"
          pagination={{ total: dataSource.length || total, pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }} />
      </Spin>
    </div>
  );
}

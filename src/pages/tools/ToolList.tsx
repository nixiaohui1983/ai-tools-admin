import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Switch,
} from "antd";
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toolsAPI, type ToolDTO } from "../../api";

const categoryOptions = [
  { value: "writing", label: "Writing" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "coding", label: "Coding" },
  { value: "marketing", label: "Marketing" },
  { value: "productivity", label: "Productivity" },
];

const pricingOptions = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "subscription", label: "Subscription" },
];

export default function ToolList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ToolDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ToolDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await toolsAPI.list({ limit: 50 });
      setData(res.data.tools);
      setTotal(res.data.total);
    } catch {
      // Mock fallback
      setData([
        { id: "1", name: "ChatGPT", slug: "chatgpt", description: "AI language model", pricing: "freemium", rating: 4.9, categories: ["writing", "coding"], featured: true },
        { id: "2", name: "Midjourney", slug: "midjourney", description: "AI image generation", pricing: "subscription", rating: 4.8, categories: ["image"], featured: true },
        { id: "3", name: "GitHub Copilot", slug: "github-copilot", description: "AI code assistant", pricing: "subscription", rating: 4.7, categories: ["coding"], featured: false },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing?.id) {
        await toolsAPI.update(editing.id, values);
        message.success("工具更新成功！");
      } else {
        await toolsAPI.create(values as ToolDTO);
        message.success("工具创建成功！");
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      message.error(err.message || "操作失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await toolsAPI.delete(id);
      message.success("工具已删除");
      fetchData();
    } catch (err: any) {
      message.error(err.message || "删除失败");
    }
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: ToolDTO) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns: ColumnsType<ToolDTO> = [
    { title: "名称", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 140,
    },
    {
      title: "分类",
      dataIndex: "categories",
      key: "categories",
      render: (cats: string[]) => (
        <Space size={[4, 4]} wrap>
          {(cats || []).map((cat) => (
            <Tag key={cat} color="blue">
              {categoryOptions.find((c) => c.value === cat)?.label || cat}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "定价",
      dataIndex: "pricing",
      key: "pricing",
      render: (p: string) => pricingOptions.find((o) => o.value === p)?.label || p,
      filters: pricingOptions.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (val, record) => record.pricing === val,
    },
    {
      title: "评分",
      dataIndex: "rating",
      key: "rating",
      render: (r: number) => (r ? `⭐ ${r}` : "-"),
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
    },
    {
      title: "推荐",
      dataIndex: "featured",
      key: "featured",
      render: (f: boolean) => (f ? <Tag color="gold">Featured</Tag> : "-"),
      filters: [
        { text: "是", value: true },
        { text: "否", value: false },
      ],
      onFilter: (val, record) => record.featured === val,
    },
    {
      title: "操作",
      key: "action",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除 ${record.name} 吗？`}
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined />}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = search
    ? data.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          (t.slug && t.slug.toLowerCase().includes(search.toLowerCase()))
      )
    : data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0">工具管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          添加工具
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="搜索工具名称..."
            prefix={<SearchOutlined />}
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <span className="text-gray-400 text-sm">共 {filteredData.length} 个工具</span>
        </div>

        <Table<ToolDTO>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 个` }}
        />
      </Card>

      <Modal
        title={editing ? "编辑工具" : "添加工具"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        width={640}
        okText={editing ? "更新" : "创建"}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="name" label="工具名称" rules={[{ required: true, message: "请输入工具名称" }]}>
              <Input placeholder="例如：ChatGPT" />
            </Form.Item>
            <Form.Item name="slug" label="Slug" rules={[{ required: true, message: "请输入 slug" }]}>
              <Input placeholder="例如：chatgpt" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="工具描述..." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="pricing" label="定价模式">
              <Select options={pricingOptions} placeholder="选择定价模式" />
            </Form.Item>
            <Form.Item name="rating" label="评分">
              <Input type="number" min={0} max={5} step={0.1} placeholder="0-5" />
            </Form.Item>
          </div>
          <Form.Item name="categories" label="分类">
            <Select mode="multiple" options={categoryOptions} placeholder="选择分类" />
          </Form.Item>
          <Form.Item name="website" label="官网链接">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="featured" label="推荐" valuePropName="checked">
            <Switch checkedChildren="推荐" unCheckedChildren="普通" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

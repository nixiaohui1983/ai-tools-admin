import { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, message, Popconfirm } from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { tasksAPI, type TaskDTO } from "../../api";

const categoryOptions = [
  { value: "content", label: "Content" },
  { value: "business", label: "Business" },
  { value: "design", label: "Design" },
  { value: "automation", label: "Automation" },
  { value: "coding", label: "Coding" },
];

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const difficultyColor: Record<string, string> = {
  easy: "green",
  medium: "orange",
  hard: "red",
};

export default function TaskList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TaskDTO[]>([]);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tasksAPI.list();
      setData(res.data || []);
    } catch {
      setData([
        { id: "1", title: "Write SEO Blog Post", description: "Create optimized blog content", difficulty: "medium", category: "content", toolCount: 3, output: "Published blog post", featured: true },
        { id: "2", title: "Make YouTube Video", description: "Automate video creation", difficulty: "hard", category: "content", toolCount: 4, output: "Published video", featured: true },
        { id: "3", title: "Automate Email Marketing", description: "Set up automated email sequences", difficulty: "easy", category: "business", toolCount: 2, output: "Email campaign", featured: false },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing?.id) {
        await tasksAPI.update(editing.id, values);
        message.success("任务更新成功！");
      } else {
        await tasksAPI.create(values as TaskDTO);
        message.success("任务创建成功！");
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
      await tasksAPI.delete(id);
      message.success("任务已删除");
      fetchData();
    } catch (err: any) {
      message.error(err.message || "删除失败");
    }
  };

  const columns: ColumnsType<TaskDTO> = [
    { title: "任务名称", dataIndex: "title", key: "title" },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => (
        <Tag color="blue">
          {categoryOptions.find((c) => c.value === cat)?.label || cat}
        </Tag>
      ),
    },
    {
      title: "难度",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (d: string) => (
        <Tag color={difficultyColor[d] || "default"}>
          {difficultyOptions.find((o) => o.value === d)?.label || d}
        </Tag>
      ),
    },
    { title: "工具数量", dataIndex: "toolCount", key: "toolCount", sorter: (a, b) => (a.toolCount || 0) - (b.toolCount || 0) },
    {
      title: "推荐",
      dataIndex: "featured",
      key: "featured",
      render: (f: boolean) => (f ? <Tag color="gold">Featured</Tag> : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除 ${record.title} 吗？`}
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0">任务管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          添加任务
        </Button>
      </div>

      <Card>
        <Table<TaskDTO>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 个` }}
        />
      </Card>

      <Modal
        title={editing ? "编辑任务" : "添加任务"}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={handleSubmit}
        width={640}
        okText={editing ? "更新" : "创建"}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="任务名称" rules={[{ required: true, message: "请输入任务名称" }]}>
            <Input placeholder="例如：Write SEO Blog Post" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="任务描述..." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="category" label="分类">
              <Select options={categoryOptions} placeholder="选择分类" />
            </Form.Item>
            <Form.Item name="difficulty" label="难度">
              <Select options={difficultyOptions} placeholder="选择难度" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="toolCount" label="工具数量">
              <Input type="number" min={0} placeholder="0" />
            </Form.Item>
            <Form.Item name="featured" label="推荐" valuePropName="checked">
              <Switch checkedChildren="推荐" unCheckedChildren="普通" />
            </Form.Item>
          </div>
          <Form.Item name="output" label="预期输出">
            <Input placeholder="例如：Published blog post" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

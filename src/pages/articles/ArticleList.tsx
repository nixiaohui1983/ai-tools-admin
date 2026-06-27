import { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, Tag, Badge, Space, Modal, Form, Input, Select, Switch, message, Popconfirm } from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { articlesAPI, type ArticleDTO } from "../../api";

const categoryOptions = [
  { value: "decision", label: "Decision Guide" },
  { value: "workflow", label: "Workflow Tutorial" },
  { value: "comparison", label: "Tool Comparison" },
  { value: "tutorial", label: "Tutorial" },
];

export default function ArticleList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ArticleDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ArticleDTO[]>([]);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await articlesAPI.list();
      setData(res.data || []);
    } catch {
      setData([
        { id: "1", title: "ChatGPT vs Claude vs Gemini: Which is Best in 2026?", slug: "chatgpt-vs-claude-vs-gemini", category: "comparison", published: true, featured: true },
        { id: "2", title: "Build a Content Marketing Stack", slug: "content-marketing-stack", category: "workflow", published: true, featured: true },
        { id: "3", title: "Best Free AI Tools for Startups", slug: "free-ai-tools-startups", category: "decision", published: false, featured: false },
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
        await articlesAPI.update(editing.id, values);
        message.success("文章更新成功！");
      } else {
        await articlesAPI.create(values as ArticleDTO);
        message.success("文章创建成功！");
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
      await articlesAPI.delete(id);
      message.success("文章已删除");
      fetchData();
    } catch (err: any) {
      message.error(err.message || "删除失败");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await articlesAPI.publish(id);
      message.success("文章已发布！");
      fetchData();
    } catch (err: any) {
      message.error(err.message || "发布失败");
    }
  };

  const columns: ColumnsType<ArticleDTO> = [
    { title: "文章标题", dataIndex: "title", key: "title", ellipsis: true },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => (
        <Tag color="purple">
          {categoryOptions.find((c) => c.value === cat)?.label || cat}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "published",
      key: "published",
      render: (p: boolean) => (
        <Badge status={p ? "success" : "default"} text={p ? "已发布" : "草稿"} />
      ),
    },
    {
      title: "推荐",
      dataIndex: "featured",
      key: "featured",
      render: (f: boolean) => (f ? <Tag color="gold">Featured</Tag> : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>
            编辑
          </Button>
          {!record.published && (
            <Button type="link" size="small" onClick={() => handlePublish(record.id!)}>
              发布
            </Button>
          )}
          <Popconfirm
            title="确认删除"
            description={`确定要删除 "${record.title}" 吗？`}
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
        <h2 className="text-2xl font-bold m-0">内容管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          写文章
        </Button>
      </div>

      <Card>
        <Table<ArticleDTO>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 篇` }}
        />
      </Card>

      <Modal
        title={editing ? "编辑文章" : "写文章"}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={handleSubmit}
        width={720}
        okText={editing ? "更新" : "创建"}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="文章标题" rules={[{ required: true, message: "请输入文章标题" }]}>
            <Input placeholder="例如：ChatGPT vs Claude Comparison" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="slug" label="Slug" rules={[{ required: true, message: "请输入 slug" }]}>
              <Input placeholder="例如：chatgpt-vs-claude" />
            </Form.Item>
            <Form.Item name="category" label="分类">
              <Select options={categoryOptions} placeholder="选择分类" />
            </Form.Item>
          </div>
          <Form.Item name="excerpt" label="摘要">
            <Input.TextArea rows={2} placeholder="文章摘要..." />
          </Form.Item>
          <Form.Item name="content" label="正文内容">
            <Input.TextArea rows={8} placeholder="支持 Markdown 格式..." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="published" label="立即发布" valuePropName="checked">
              <Switch checkedChildren="发布" unCheckedChildren="草稿" />
            </Form.Item>
            <Form.Item name="featured" label="推荐文章" valuePropName="checked">
              <Switch checkedChildren="推荐" unCheckedChildren="普通" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Switch, message, Popconfirm } from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { workflowsAPI, type WorkflowDTO } from "../../api";

export default function WorkflowList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WorkflowDTO[]>([]);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workflowsAPI.list();
      setData(res.data || []);
    } catch {
      setData([
        { id: "1", name: "Write SEO Blog in 30 min", description: "Complete blog writing workflow", isTemplate: true, featured: true },
        { id: "2", name: "YouTube Automation System", description: "Automated video creation", isTemplate: true, featured: true },
        { id: "3", name: "AI eCommerce Product Generator", description: "Product listing automation", isTemplate: false, featured: false },
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
        await workflowsAPI.update(editing.id, values);
        message.success("工作流更新成功！");
      } else {
        await workflowsAPI.create(values as WorkflowDTO);
        message.success("工作流创建成功！");
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
      await workflowsAPI.delete(id);
      message.success("工作流已删除");
      fetchData();
    } catch (err: any) {
      message.error(err.message || "删除失败");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await workflowsAPI.publish(id);
      message.success("工作流已发布！");
      fetchData();
    } catch (err: any) {
      message.error(err.message || "发布失败");
    }
  };

  const columns: ColumnsType<WorkflowDTO> = [
    { title: "工作流名称", dataIndex: "name", key: "name" },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 240,
    },
    {
      title: "模板",
      dataIndex: "isTemplate",
      key: "isTemplate",
      render: (val: boolean) => (
        <Tag color={val ? "green" : "default"}>
          {val ? "是" : "否"}
        </Tag>
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); }}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handlePublish(record.id!)}>
            发布
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0">工作流管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
          创建工作流
        </Button>
      </div>

      <Card>
        <Table<WorkflowDTO>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 个` }}
        />
      </Card>

      <Modal
        title={editing ? "编辑工作流" : "创建工作流"}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        onOk={handleSubmit}
        width={640}
        okText={editing ? "更新" : "创建"}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="工作流名称" rules={[{ required: true, message: "请输入工作流名称" }]}>
            <Input placeholder="例如：Write SEO Blog in 30 min" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="工作流描述..." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="isTemplate" label="设为模板" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
            <Form.Item name="featured" label="推荐" valuePropName="checked">
              <Switch checkedChildren="推荐" unCheckedChildren="普通" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

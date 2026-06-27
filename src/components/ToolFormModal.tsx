import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Switch, message } from "antd";
import { toolsAPI, type ToolDTO } from "../api";

interface ToolFormModalProps {
  open: boolean;
  initialData?: ToolDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const pricingOptions = [
  { label: "Free", value: "free" },
  { label: "Freemium", value: "freemium" },
  { label: "Subscription", value: "subscription" },
  { label: "Paid", value: "paid" },
  { label: "Enterprise", value: "enterprise" },
];

export default function ToolFormModal({ open, initialData, onClose, onSuccess }: ToolFormModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (isEdit && initialData?.id) {
        await toolsAPI.update(initialData.id, values);
        message.success("工具已更新");
      } else {
        await toolsAPI.create(values);
        message.success("工具已创建");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      message.error(err?.message || "操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "编辑工具" : "新增工具"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入工具名称" }]}>
          <Input placeholder="例如: ChatGPT" />
        </Form.Item>
        <Form.Item name="slug" label="Slug" rules={[{ required: true, message: "请输入 slug" }]}>
          <Input placeholder="例如: chatgpt" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="工具简介" />
        </Form.Item>
        <Form.Item name="logo" label="Logo URL">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="website" label="官网 URL">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="pricing" label="定价模式">
          <Select options={pricingOptions} placeholder="选择定价模式" allowClear />
        </Form.Item>
        <Form.Item name="price" label="价格 (USD)">
          <InputNumber min={0} style={{ width: "100%" }} placeholder="0 表示免费" />
        </Form.Item>
        <Form.Item name="rating" label="评分">
          <InputNumber min={0} max={5} step={0.1} style={{ width: "100%" }} placeholder="0 ~ 5" />
        </Form.Item>
        <Form.Item name="categories" label="分类标签">
          <Select mode="tags" placeholder="输入后回车添加标签" />
        </Form.Item>
        <Form.Item name="featured" label="精选推荐" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

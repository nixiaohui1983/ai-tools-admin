import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Switch, message } from "antd";
import { articlesAPI, type ArticleDTO } from "../api";

interface ArticleFormModalProps {
  open: boolean;
  initialData?: ArticleDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const categoryOptions = [
  { label: "对比评测", value: "comparison" },
  { label: "使用指南", value: "guide" },
  { label: "工作流", value: "workflow" },
  { label: "工具评测", value: "review" },
];

export default function ArticleFormModal({ open, initialData, onClose, onSuccess }: ArticleFormModalProps) {
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
        await articlesAPI.update(initialData.id, values);
        message.success("文章已更新");
      } else {
        await articlesAPI.create(values);
        message.success("文章已创建");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || "操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "编辑文章" : "新增文章"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={720}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入文章标题" }]}>
          <Input placeholder="文章标题" />
        </Form.Item>
        <Form.Item name="slug" label="Slug">
          <Input placeholder="例如: best-ai-tools-2024" />
        </Form.Item>
        <Form.Item name="content" label="内容">
          <Input.TextArea rows={8} placeholder="Markdown 内容" />
        </Form.Item>
        <Form.Item name="excerpt" label="摘要">
          <Input.TextArea rows={2} placeholder="文章摘要" />
        </Form.Item>
        <Form.Item name="category" label="分类">
          <Select options={categoryOptions} placeholder="选择分类" allowClear />
        </Form.Item>
        <Form.Item name="published" label="发布" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="featured" label="精选推荐" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

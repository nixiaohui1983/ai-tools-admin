import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Switch, message } from "antd";
import { tasksAPI, type TaskDTO } from "../api";

interface TaskFormModalProps {
  open: boolean;
  initialData?: TaskDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const difficultyOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

export default function TaskFormModal({ open, initialData, onClose, onSuccess }: TaskFormModalProps) {
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
        await tasksAPI.update(initialData.id, values);
        message.success("任务已更新");
      } else {
        await tasksAPI.create(values);
        message.success("任务已创建");
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
      title={isEdit ? "编辑任务" : "新增任务"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入任务标题" }]}>
          <Input placeholder="例如: 搭建个人博客" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="任务描述" />
        </Form.Item>
        <Form.Item name="difficulty" label="难度">
          <Select options={difficultyOptions} placeholder="选择难度" allowClear />
        </Form.Item>
        <Form.Item name="category" label="分类">
          <Input placeholder="例如: web-development" />
        </Form.Item>
        <Form.Item name="toolCount" label="工具数量">
          <InputNumber min={0} style={{ width: "100%" }} placeholder="所需工具数量" />
        </Form.Item>
        <Form.Item name="output" label="产出物">
          <Input placeholder="例如: 一个可部署的博客网站" />
        </Form.Item>
        <Form.Item name="icon" label="图标 (Emoji)">
          <Input placeholder="例如: 🚀" maxLength={4} />
        </Form.Item>
        <Form.Item name="featured" label="精选推荐" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

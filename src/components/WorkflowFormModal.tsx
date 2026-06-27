import { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, message } from "antd";
import { workflowsAPI, type WorkflowDTO } from "../api";

interface WorkflowFormModalProps {
  open: boolean;
  initialData?: WorkflowDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WorkflowFormModal({ open, initialData, onClose, onSuccess }: WorkflowFormModalProps) {
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
        await workflowsAPI.update(initialData.id, values);
        message.success("工作流已更新");
      } else {
        await workflowsAPI.create(values);
        message.success("工作流已创建");
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
      title={isEdit ? "编辑工作流" : "新增工作流"}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入工作流名称" }]}>
          <Input placeholder="例如: 全栈 Web 应用开发" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="工作流描述" />
        </Form.Item>
        <Form.Item name="isTemplate" label="模板" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="featured" label="精选推荐" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

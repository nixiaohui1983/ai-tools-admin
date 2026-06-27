import { Modal, Typography, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ConfirmDeleteProps {
  open: boolean;
  title?: string;
  content?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDelete({
  open,
  title = "确认删除",
  content,
  itemName,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDeleteProps) {
  return (
    <Modal
      open={open}
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: 18 }} />
          <span>{title}</span>
        </Space>
      }
      onOk={onConfirm}
      onCancel={onCancel}
      okText="确认删除"
      cancelText="取消"
      okButtonProps={{ danger: true, loading }}
      width={440}
    >
      <Text type="secondary">
        {content || `确定要删除${itemName ? `"${itemName}"` : "此项"}吗？此操作不可撤销。`}
      </Text>
    </Modal>
  );
}

import { Table, Button, Tag, Space, Input, Avatar, Popconfirm, message } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../../components/PageHeader";

interface UserItem {
  key: string;
  id: string;
  email: string;
  name: string;
  avatar?: string;
  savedTools: number;
  savedWorkflows: number;
  createdAt: string;
  status: "active" | "inactive";
}

const mockUsers: UserItem[] = [
  { key: "1", id: "1", email: "alice@example.com", name: "Alice Chen", savedTools: 12, savedWorkflows: 5, createdAt: "2026-01-15", status: "active" },
  { key: "2", id: "2", email: "bob@example.com", name: "Bob Wang", savedTools: 8, savedWorkflows: 3, createdAt: "2026-02-20", status: "active" },
  { key: "3", id: "3", email: "carol@example.com", name: "Carol Li", savedTools: 15, savedWorkflows: 7, createdAt: "2026-03-10", status: "active" },
  { key: "4", id: "4", email: "dave@example.com", name: "Dave Zhang", savedTools: 3, savedWorkflows: 1, createdAt: "2026-05-01", status: "inactive" },
  { key: "5", id: "5", email: "eve@example.com", name: "Eve Liu", savedTools: 20, savedWorkflows: 10, createdAt: "2026-04-15", status: "active" },
];

export default function UserList() {
  const columns: ColumnsType<UserItem> = [
    {
      title: "用户",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} src={record.avatar} style={{ backgroundColor: "#6366F1" }} />
          <div>
            <div className="font-semibold text-gray-900">{name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "保存工具",
      dataIndex: "savedTools",
      key: "savedTools",
      width: 100,
      sorter: (a, b) => a.savedTools - b.savedTools,
    },
    {
      title: "保存工作流",
      dataIndex: "savedWorkflows",
      key: "savedWorkflows",
      width: 120,
      sorter: (a, b) => a.savedWorkflows - b.savedWorkflows,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      filters: [
        { text: "活跃", value: "active" },
        { text: "非活跃", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) =>
        status === "active" ? (
          <Tag color="green">活跃</Tag>
        ) : (
          <Tag color="default">非活跃</Tag>
        ),
    },
    {
      title: "注册日期",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => message.info(`查看用户: ${record.name}`)} />
          <Popconfirm title="确定删除此用户？" onConfirm={() => message.success("已删除")} okText="确认" cancelText="取消">
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="用户管理"
        description="管理注册用户，查看使用数据和收藏情况"
      />
      <div className="mb-4">
        <Input placeholder="搜索用户..." prefix={<SearchOutlined />} style={{ width: 300 }} allowClear />
      </div>
      <Table columns={columns} dataSource={mockUsers} rowKey="id" pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 位用户` }} />
    </div>
  );
}

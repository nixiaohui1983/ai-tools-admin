import { useState, useEffect } from "react";
import { Card, Table, Tag, Space, Button, Input, Select, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface UserRecord {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  savedTools: number;
  savedWorkflows: number;
}

const mockUsers: UserRecord[] = [
  { id: "1", email: "user@example.com", name: "Demo User", role: "user", createdAt: "2026-06-01", savedTools: 5, savedWorkflows: 2 },
  { id: "2", email: "admin@aistackhub.com", name: "Admin", role: "admin", createdAt: "2026-05-15", savedTools: 0, savedWorkflows: 0 },
];

const roleOptions = [
  { value: "user", label: "普通用户" },
  { value: "admin", label: "管理员" },
];

export default function UserList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");

  const fetchData = () => {
    setLoading(true);
    // Mock: in production, fetch from API
    setTimeout(() => {
      setData(mockUsers);
      setLoading(false);
    }, 300);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = (userId: string, newRole: string) => {
    setData((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    message.success("角色已更新");
  };

  const columns: ColumnsType<UserRecord> = [
    { title: "邮箱", dataIndex: "email", key: "email", sorter: (a, b) => a.email.localeCompare(b.email) },
    { title: "名称", dataIndex: "name", key: "name", render: (n) => n || "-" },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role: string, record) => (
        <Space>
          <Tag color={role === "admin" ? "red" : "blue"}>
            {role === "admin" ? "管理员" : "用户"}
          </Tag>
          <Select
            size="small"
            value={role}
            options={roleOptions}
            onChange={(val) => handleRoleChange(record.id, val)}
            style={{ width: 90 }}
          />
        </Space>
      ),
    },
    { title: "收藏工具", dataIndex: "savedTools", key: "savedTools", sorter: (a, b) => a.savedTools - b.savedTools },
    { title: "收藏工作流", dataIndex: "savedWorkflows", key: "savedWorkflows", sorter: (a, b) => a.savedWorkflows - b.savedWorkflows },
    { title: "注册时间", dataIndex: "createdAt", key: "createdAt", sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
  ];

  const filteredData = search
    ? data.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
      )
    : data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0">用户管理</h2>
        <Button type="primary" disabled>
          邀请用户
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="搜索邮箱或名称..."
            prefix={<SearchOutlined />}
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <span className="text-gray-400 text-sm">共 {filteredData.length} 人</span>
        </div>

        <Table<UserRecord>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 人` }}
        />
      </Card>
    </div>
  );
}

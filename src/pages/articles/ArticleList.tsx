import { useState, useEffect } from "react";
import { Table, Button, Tag, Space, message, Popconfirm, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../../components/PageHeader";
import { articlesAPI, type ArticleDTO } from "../../api";

const categoryLabels: Record<string, string> = {
  comparison: "对比评测", guide: "使用指南", workflow: "工作流", review: "工具评测",
};

export default function ArticleList() {
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await articlesAPI.list();
      setArticles(res.data.map((a: any) => ({ ...a, key: a.id })));
      setTotal(res.total);
    } catch {
      message.warning("API unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArticles(); }, []);

  const columns: ColumnsType<any> = [
    {
      title: "Title", dataIndex: "title", key: "title", width: 300,
      render: (t: string, r: any) => (
        <div><div className="font-semibold">{t}</div><div className="text-xs text-gray-500">{r.excerpt?.slice(0, 80)}</div></div>
      ),
    },
    { title: "Slug", dataIndex: "slug", key: "slug", width: 180, ellipsis: true },
    {
      title: "Category", dataIndex: "category", key: "category", width: 100,
      render: (c: string) => <Tag color="blue">{categoryLabels[c] || c}</Tag>,
    },
    {
      title: "Status", dataIndex: "published", key: "published", width: 80,
      filters: [{ text: "Published", value: true }, { text: "Draft", value: false }],
      onFilter: (v: any, r: any) => r.published === v,
      render: (p: boolean) => <Tag color={p ? "green" : "default"}>{p ? "已发布" : "草稿"}</Tag>,
    },
    {
      title: "Featured", dataIndex: "featured", key: "featured", width: 70,
      render: (f: boolean) => f ? "⭐" : "—",
    },
    { title: "Views", dataIndex: "viewCount", key: "viewCount", width: 70 },
    {
      title: "Date", dataIndex: "publishedAt", key: "publishedAt", width: 110,
      render: (d: string) => d ? new Date(d).toLocaleDateString() : "—",
    },
    {
      title: "Actions", key: "actions", width: 140, fixed: "right" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => message.info(`Edit ${record.title}`)} />
          <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => message.info(`Preview ${record.title}`)} />
          <Popconfirm title="确定删除？" onConfirm={async () => {
            try { await articlesAPI.delete(record.id); message.success("已删除"); loadArticles(); } catch { message.error("删除失败"); }
          }}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="内容管理" description="管理 SEO 内容文章"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => message.info("新增文章")}>新增文章</Button>} />
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={articles} rowKey="id"
          pagination={{ total, pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
      </Spin>
    </div>
  );
}

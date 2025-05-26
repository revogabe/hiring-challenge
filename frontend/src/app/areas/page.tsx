"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { areaApi, plantApi, Area, Plant } from "@/services/api";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import { useSearchParams, useRouter } from "next/navigation";

export default function AreasPage() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [filters, setFilters] = useState({
    name: "",
    plantId: "",
    neighbors: "",
  });
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const plantId = searchParams.get("plantId");

  const { data: areas, isLoading: areasLoading } = useQuery("areas", () =>
    areaApi.getAll().then((res) => res.data)
  );

  const { data: plants, isLoading: plantsLoading } = useQuery("plants", () =>
    plantApi.getAll().then((res) => res.data)
  );

  const filterAreaByPlant = (areas: Area[] | undefined, plantId: string) => {
    if (!areas) return [];
    if (!plantId) return areas;
    return areas.filter((area) => area.plantId === plantId);
  };

  // Set initial plant filter if plantId is provided
  useEffect(() => {
    if (plantId) {
      setFilters((prev) => ({ ...prev, plantId }));
    }
  }, [plantId]);

  const createMutation = useMutation(
    (data: Omit<Area, "id" | "createdAt" | "updatedAt">) =>
      areaApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("areas");
        message.success("Area created successfully");
        setIsModalVisible(false);
        form.resetFields();
      },
      onError: (error: any) => {
        message.error(`Failed to create area: ${error.message}`);
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Area> }) =>
      areaApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("areas");
        message.success("Area updated successfully");
        setIsModalVisible(false);
        setEditingArea(null);
        form.resetFields();
      },
      onError: (error: any) => {
        message.error(`Failed to update area: ${error.message}`);
      },
    }
  );

  const deleteMutation = useMutation((id: string) => areaApi.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries("areas");
      message.success("Area deleted successfully");
    },
  });

  const filteredAreas = areas?.filter((area) => {
    const nameMatch = area.name
      .toLowerCase()
      .includes(filters.name.toLowerCase());
    const plantMatch = !filters.plantId || area.plantId === filters.plantId;
    return nameMatch && plantMatch;
  });

  const columns: TableProps<Area>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Location Description",
      dataIndex: "locationDescription",
      key: "locationDescription",
    },
    {
      title: "Plant",
      dataIndex: ["plant", "name"],
      key: "plant",
      sorter: (a, b) =>
        (a.plant?.name || "").localeCompare(b.plant?.name || ""),
    },
    {
      title: "Neighboring Areas",
      dataIndex: "neighbors",
      key: "neighbors",
      render: (_, record) => (
        <span
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 8,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {record.neighbors?.map((area: Area) => (
            <span
              key={area.id}
              title={area.name}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "4px 8px",
                borderRadius: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {area.name}
            </span>
          ))}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue(record);
              setEditingArea(record);
              setIsModalVisible(true);
            }}
          />
          <Button
            icon={<RightOutlined />}
            onClick={() => {
              router.push(`/equipment?areaId=${record.id}`);
            }}
          >
            Equipment
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              Modal.confirm({
                title: "Are you sure you want to delete this area?",
                onOk: () => deleteMutation.mutate(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <div style={{ marginBottom: 16 }}>
        <Space size="large">
          <Input
            placeholder="Filter by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            style={{ width: 200 }}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Filter by plant"
            allowClear
            value={filters.plantId || undefined}
            onChange={(value) => setFilters({ ...filters, plantId: value })}
          >
            {plants?.map((plant) => (
              <Select.Option key={plant.id} value={plant.id}>
                {plant.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingArea(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Add Area
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAreas}
        loading={areasLoading || plantsLoading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />

      <Modal
        title={editingArea ? "Edit Area" : "Add Area"}
        open={isModalVisible}
        afterOpenChange={() => form.resetFields(["neighborIDs"])}
        onCancel={() => {
          form.resetFields();
          setIsModalVisible(false);
          setEditingArea(null);
        }}
        destroyOnHidden
        footer={null}
      >
        <Form
          form={form}
          onFinish={(values) => {
            if (editingArea) {
              updateMutation.mutate({ id: editingArea.id, data: values });
            } else {
              createMutation.mutate(values);
            }
          }}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the area name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="locationDescription"
            label="Location Description"
            rules={[
              {
                required: true,
                message: "Please input the location description!",
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="plantId"
            label="Plant"
            rules={[{ required: true, message: "Please select a plant!" }]}
          >
            <Select>
              {plants?.map((plant) => (
                <Select.Option key={plant.id} value={plant.id}>
                  {plant.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="neighborIDs"
            label="Neighboring Areas"
            initialValue={editingArea?.neighbors?.map((area) => area.id) || []}
          >
            <Select
              mode="multiple"
              placeholder="Select neighboring areas"
              style={{ width: "100%" }}
              optionFilterProp="children"
              showSearch
              allowClear
            >
              {filterAreaByPlant(areas, form.getFieldValue(["plantId"]))?.map(
                (area) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.name}
                  </Select.Option>
                )
              )}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingArea ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

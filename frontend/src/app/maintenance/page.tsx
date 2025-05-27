"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tabs,
  Select,
  DatePicker,
  Tag,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  maintenanceApi,
  partApi,
  equipmentApi,
  Maintenance,
  MaintenanceFrequencyType,
  MaintenanceReferenceType,
} from "@/services/api";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { TabsProps, TableProps } from "antd";
import dayjs from "dayjs";
import { Calendar } from "./Calendar";

export default function MaintenancePage() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMaintenance, setEditingMaintenance] =
    useState<Maintenance | null>(null);
  const [filters, setFilters] = useState({
    title: "",
    partId: "",
    equipmentId: "",
    isCompleted: undefined as boolean | undefined,
  });
  const queryClient = useQueryClient();

  // Queries
  const { data: maintenances, isLoading: maintenancesLoading } = useQuery(
    "maintenances",
    () => maintenanceApi.getAll().then((res) => res.data)
  );

  const { data: futureMaintenance, isLoading: futureMaintenanceLoading } =
    useQuery("futureMaintenance", () =>
      maintenanceApi.getFuture().then((res) => res.data)
    );

  const { data: parts, isLoading: partsLoading } = useQuery("parts", () =>
    partApi.getAll().then((res) => res.data)
  );

  const { data: equipment, isLoading: equipmentLoading } = useQuery(
    "equipment",
    () => equipmentApi.getAll().then((res) => res.data)
  );

  // Mutations
  const createMutation = useMutation(
    (
      data: Omit<Maintenance, "id" | "createdAt" | "updatedAt" | "nextDueDate">
    ) => maintenanceApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("maintenances");
        queryClient.invalidateQueries("futureMaintenance");
        message.success("Manutenção criada com sucesso");
        setIsModalVisible(false);
        form.resetFields();
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Maintenance> }) =>
      maintenanceApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("maintenances");
        queryClient.invalidateQueries("futureMaintenance");
        message.success("Manutenção atualizada com sucesso");
        setIsModalVisible(false);
        form.resetFields();
        setEditingMaintenance(null);
      },
    }
  );

  const completeMutation = useMutation(
    ({ id, completedDate }: { id: string; completedDate?: Date }) =>
      maintenanceApi.complete(id, completedDate),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("maintenances");
        queryClient.invalidateQueries("futureMaintenance");
        message.success("Manutenção marcada como concluída");
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => maintenanceApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("maintenances");
        queryClient.invalidateQueries("futureMaintenance");
        message.success("Manutenção excluída com sucesso");
      },
    }
  );

  // Filter maintenances
  const filteredMaintenances = maintenances?.filter((maintenance) => {
    const titleMatch = maintenance.title
      .toLowerCase()
      .includes(filters.title.toLowerCase());
    const partMatch = !filters.partId || maintenance.partId === filters.partId;
    const completedMatch =
      filters.isCompleted === undefined ||
      maintenance.isCompleted === filters.isCompleted;

    return titleMatch && partMatch && completedMatch;
  });

  // Table columns
  const columns: TableProps<Maintenance>["columns"] = [
    {
      title: "Status",
      dataIndex: "isCompleted",
      key: "status",
      render: (isCompleted) =>
        isCompleted ? (
          <Tag color="green">Concluída</Tag>
        ) : (
          <Tag color="blue">Pendente</Tag>
        ),
    },
    {
      title: "Data Limite",
      dataIndex: "nextDueDate",
      key: "nextDueDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
      sorter: (a, b) => {
        if (!a.nextDueDate) return 1;
        if (!b.nextDueDate) return -1;
        return dayjs(a.nextDueDate).unix() - dayjs(b.nextDueDate).unix();
      },
      defaultSortOrder: "ascend",
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Peça",
      dataIndex: ["part", "name"],
      key: "part",
      render: (_, record) => record.part?.name || "N/A",
    },
    {
      title: "Equipamento",
      key: "equipment",
      render: (_, record) => {
        if (record.part?.equipment) {
          return record.part.equipment.name;
        }
        return "N/A";
      },
    },
    {
      title: "Área",
      key: "area",
      render: (_, record) => {
        if (
          record.part?.equipment?.areas &&
          record.part?.equipment.areas.length > 0
        ) {
          return record.part?.equipment.areas[0].name;
        }
        return "N/A";
      },
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingMaintenance(record);
              form.setFieldsValue({
                ...record,
                specificDate: record.specificDate
                  ? dayjs(record.specificDate)
                  : undefined,
              });
              setIsModalVisible(true);
            }}
          />
          {!record.isCompleted && (
            <Button
              icon={<CheckCircleOutlined />}
              type="primary"
              onClick={() => {
                Modal.confirm({
                  title: "Confirmar conclusão",
                  content: "Deseja marcar esta manutenção como concluída?",
                  onOk: () => completeMutation.mutate({ id: record.id }),
                });
              }}
            >
              Concluir
            </Button>
          )}
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              Modal.confirm({
                title: "Tem certeza que deseja excluir esta manutenção?",
                onOk: () => deleteMutation.mutate(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  // Tab items
  const tabItems: TabsProps["items"] = [
    {
      key: "list",
      label: "Lista de Manutenções",
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Space size="large">
              <Input
                placeholder="Filtrar por título"
                value={filters.title}
                onChange={(e) =>
                  setFilters({ ...filters, title: e.target.value })
                }
                style={{ width: 200 }}
              />
              <Select
                style={{ width: 200 }}
                placeholder="Filtrar por peça"
                allowClear
                value={filters.partId || undefined}
                onChange={(value) => setFilters({ ...filters, partId: value })}
              >
                {parts?.map((part) => (
                  <Select.Option key={part.id} value={part.id}>
                    {part.name}
                  </Select.Option>
                ))}
              </Select>
              <Select
                style={{ width: 200 }}
                placeholder="Filtrar por equipamento"
                allowClear
                value={filters.equipmentId || undefined}
                onChange={(value) =>
                  setFilters({ ...filters, equipmentId: value })
                }
              >
                {equipment?.map((eq) => (
                  <Select.Option key={eq.id} value={eq.id}>
                    {eq.name}
                  </Select.Option>
                ))}
              </Select>
              <Select
                style={{ width: 200 }}
                placeholder="Status"
                allowClear
                value={filters.isCompleted}
                onChange={(value) =>
                  setFilters({ ...filters, isCompleted: value })
                }
              >
                <Select.Option value={false}>Pendente</Select.Option>
                <Select.Option value={true}>Concluída</Select.Option>
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingMaintenance(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Adicionar Manutenção
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredMaintenances}
            loading={maintenancesLoading || partsLoading || equipmentLoading}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} itens`,
            }}
          />
        </>
      ),
    },
    {
      key: "calendar",
      label: (
        <span>
          <CalendarOutlined /> Calendário
        </span>
      ),
      children: (
        <div>
          <Calendar maintenances={futureMaintenance || []} />
        </div>
      ),
    },
    {
      key: "future",
      label: "Manutenções Futuras",
      children: (
        <Table
          columns={columns.filter((col) => col.key !== "status")}
          dataSource={futureMaintenance}
          loading={futureMaintenanceLoading || partsLoading || equipmentLoading}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} itens`,
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <Tabs defaultActiveKey="list" items={tabItems} />

      <Modal
        title={
          editingMaintenance ? "Editar Manutenção" : "Adicionar Manutenção"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingMaintenance(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={(values) => {
            // Convert dates to ISO strings
            const formattedData = {
              ...values,
              specificDate: values.specificDate
                ? values.specificDate.format("YYYY-MM-DD")
                : undefined,
            };

            if (editingMaintenance) {
              updateMutation.mutate({
                id: editingMaintenance.id,
                data: formattedData,
              });
            } else {
              createMutation.mutate(formattedData);
            }
          }}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: "Por favor, insira o título!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Descrição">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="frequencyType"
            label="Tipo de Frequência"
            rules={[
              {
                required: true,
                message: "Por favor, selecione o tipo de frequência!",
              },
            ]}
          >
            <Select>
              <Select.Option value={MaintenanceFrequencyType.DAYS}>
                Dias
              </Select.Option>
              <Select.Option value={MaintenanceFrequencyType.WEEKS}>
                Semanas
              </Select.Option>
              <Select.Option value={MaintenanceFrequencyType.MONTHS}>
                Meses
              </Select.Option>
              <Select.Option value={MaintenanceFrequencyType.YEARS}>
                Anos
              </Select.Option>
              <Select.Option value={MaintenanceFrequencyType.SPECIFIC_DATE}>
                Data Específica
              </Select.Option>
            </Select>
          </Form.Item>

          {form.getFieldValue("frequencyType") !==
            MaintenanceFrequencyType.SPECIFIC_DATE && (
            <Form.Item
              name="frequencyValue"
              label="Valor da Frequência"
              rules={[
                {
                  required: true,
                  message: "Por favor, insira o valor da frequência!",
                },
              ]}
            >
              <Input type="number" min={1} />
            </Form.Item>
          )}

          {form.getFieldValue("frequencyType") ===
            MaintenanceFrequencyType.SPECIFIC_DATE && (
            <Form.Item
              name="specificDate"
              label="Data Específica"
              rules={[
                {
                  required: true,
                  message: "Por favor, selecione uma data específica!",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          )}

          <Form.Item
            name="referenceType"
            label="Referência para Cálculo"
            rules={[
              { required: true, message: "Por favor, selecione a referência!" },
            ]}
          >
            <Select>
              <Select.Option value={MaintenanceReferenceType.PART_INSTALLATION}>
                Data de Instalação da Peça
              </Select.Option>
              <Select.Option
                value={MaintenanceReferenceType.EQUIPMENT_OPERATION}
              >
                Data de Início de Operação do Equipamento
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="partId"
            label="Peça"
            rules={[
              {
                required: form.getFieldValue("equipmentId") === undefined,
                message: "Por favor, selecione uma peça ou um equipamento!",
              },
            ]}
          >
            <Select allowClear>
              {parts?.map((part) => (
                <Select.Option key={part.id} value={part.id}>
                  {part.name} ({part.equipment?.name || "Sem equipamento"})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingMaintenance ? "Atualizar" : "Criar"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

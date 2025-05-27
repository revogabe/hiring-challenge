"use client";

import React, { useState } from "react";
import { useCalendarState } from "react-stately";
import { createCalendar } from "@internationalized/date";
import { DateValue } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { Maintenance } from "@/services/api";
import dayjs from "dayjs";
import { Card, Badge, Modal, List, Typography } from "antd";
import styles from "./Calendar.module.css";

const { Text } = Typography;

interface CalendarProps {
  maintenances: Maintenance[];
}

interface CalendarCellProps {
  date: DateValue;
  maintenances: Maintenance[];
}

const CalendarCell = ({ date, maintenances }: CalendarCellProps) => {
  const dateStr = date.toString();
  const dateMaintenances = maintenances.filter(
    (m) =>
      m.nextDueDate && dayjs(m.nextDueDate).format("YYYY-MM-DD") === dateStr
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className={styles.calendarCell}
      onClick={() => dateMaintenances.length > 0 && setIsModalOpen(true)}
    >
      <div className={styles.cellDate}>{date.day}</div>
      {dateMaintenances.length > 0 && (
        <Badge
          count={dateMaintenances.length}
          style={{ backgroundColor: "#1677ff" }}
        />
      )}

      <Modal
        title={`Manutenções de ${dayjs(dateStr).format("DD/MM/YYYY")}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <List
          itemLayout="horizontal"
          dataSource={dateMaintenances}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    <div>
                      <strong>Descrição:</strong>{" "}
                      {item.description || "Nenhuma descrição"}
                    </div>
                    <div>
                      <strong>Peça:</strong> {item.part?.name || "N/A"}
                    </div>
                    <div>
                      <strong>Equipamento:</strong>{" "}
                      {item.part?.equipment?.name ?? "N/A"}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export const Calendar = ({ maintenances }: CalendarProps) => {
  const { locale } = useLocale();
  const state = useCalendarState({
    createCalendar,
    locale,
  });

  // Group maintenances by month
  const monthYearStr = `${state.visibleRange.start.month}/${state.visibleRange.start.year}`;

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <button
          onClick={() =>
            state.setFocusedDate(state.focusedDate.subtract({ months: 1 }))
          }
        >
          &lt; Anterior
        </button>
        <h2>{monthYearStr}</h2>
        <button
          onClick={() =>
            state.setFocusedDate(state.focusedDate.add({ months: 1 }))
          }
        >
          Próximo &gt;
        </button>
      </div>

      <div className={styles.calendarGrid}>
        {/* Weekday headers */}
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className={styles.calendarWeekday}>
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <React.Fragment key={`week-${weekIndex}`}>
            {state
              .getDatesInWeek(weekIndex, state.visibleRange.start)
              .map((date, dayIndex) =>
                date ? (
                  <CalendarCell
                    key={`cell-${weekIndex}-${dayIndex}`}
                    date={date}
                    maintenances={maintenances}
                  />
                ) : (
                  <div
                    key={`empty-${weekIndex}-${dayIndex}`}
                    className={styles.emptyCell}
                  />
                )
              )}
          </React.Fragment>
        ))}
      </div>

      <div className={styles.calendarLegend}>
        <Card title="Próximas Manutenções" size="small">
          <List
            size="small"
            dataSource={maintenances.slice(0, 5)} // Show only 5 upcoming maintenances
            renderItem={(item) => (
              <List.Item>
                <Text strong>
                  {dayjs(item.nextDueDate).format("DD/MM/YYYY")}:
                </Text>{" "}
                {item.title}
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

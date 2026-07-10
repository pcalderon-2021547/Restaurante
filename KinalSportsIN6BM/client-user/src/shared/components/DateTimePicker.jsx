import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, Platform } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../constants/theme";
import Button from "./Button";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const DatePickerModal = ({ visible, onClose, onSelect, initial }) => {
  const today = new Date();
  const [year, setYear] = useState(initial?.getFullYear() || today.getFullYear());
  const [month, setMonth] = useState(initial?.getMonth() || today.getMonth());
  const [selectedDay, setSelectedDay] = useState(initial?.getDate() || null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const handleSelect = (day) => {
    setSelectedDay(day);
    onSelect(new Date(year, month, day));
    onClose();
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const isFuture = year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth());

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Seleccionar fecha</Text>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth}><Text style={styles.navArrow}>◀</Text></TouchableOpacity>
            <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth}><Text style={styles.navArrow}>▶</Text></TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {DAYS.map(d => <Text key={d} style={styles.weekDay}>{d}</Text>)}
          </View>
          <View style={styles.daysGrid}>
            {calendarDays.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dayCell,
                  !day && styles.dayEmpty,
                  day === selectedDay && styles.daySelected,
                  day && day < today.getDate() && month === today.getMonth() && year === today.getFullYear() && styles.dayDisabled,
                ]}
                onPress={() => day && handleSelect(day)}
                disabled={!day || (day < today.getDate() && month === today.getMonth() && year === today.getFullYear())}
              >
                <Text style={[
                  styles.dayText,
                  day === selectedDay && styles.dayTextSelected,
                  day && day < today.getDate() && month === today.getMonth() && year === today.getFullYear() && styles.dayTextDisabled,
                ]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Cancelar" variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const HOURS = Array.from({ length: 14 }, (_, i) => String(i + 10).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const TimePickerModal = ({ visible, onClose, onSelect, initial }) => {
  const [hour, setHour] = useState(initial?.split(":")[0] || "12");
  const [minute, setMinute] = useState(initial?.split(":")[1] || "00");

  const handleSelect = () => {
    onSelect(`${hour}:${minute}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Seleccionar hora</Text>
          <View style={styles.timeRow}>
            <FlatList
              data={HOURS}
              keyExtractor={h => h}
              style={styles.timeList}
              contentContainerStyle={styles.timeListContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.timeItem, hour === item && styles.timeItemActive]}
                  onPress={() => setHour(item)}
                >
                  <Text style={[styles.timeItemText, hour === item && styles.timeItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <Text style={styles.timeSep}>:</Text>
            <FlatList
              data={MINUTES}
              keyExtractor={m => m}
              style={styles.timeList}
              contentContainerStyle={styles.timeListContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.timeItem, minute === item && styles.timeItemActive]}
                  onPress={() => setMinute(item)}
                >
                  <Text style={[styles.timeItemText, minute === item && styles.timeItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={styles.timeBtns}>
            <Button title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <Button title="OK" onPress={handleSelect} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const DateTimePicker = ({ value, onChange, mode = "date", placeholder }) => {
  const [show, setShow] = useState(false);

  const handleSelect = (val) => {
    if (mode === "date") {
      const d = val;
      onChange(d.toISOString().slice(0, 10));
    } else {
      onChange(val);
    }
  };

  const displayValue = value || "";
  const displayLabel = mode === "date"
    ? (value ? new Date(value + "T12:00").toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" }) : placeholder || "Seleccionar fecha")
    : (value || placeholder || "Seleccionar hora");

  const Picker = mode === "date" ? DatePickerModal : TimePickerModal;

  const initialDate = mode === "date" && value ? new Date(value + "T12:00") : undefined;
  const initialTime = mode === "time" ? value : undefined;

  return (
    <>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShow(true)}>
        <Text style={[styles.pickerText, !value && styles.pickerPlaceholder]}>{displayLabel}</Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>
      <Picker
        visible={show}
        onClose={() => setShow(false)}
        onSelect={handleSelect}
        initial={mode === "date" ? initialDate : initialTime}
      />
    </>
  );
};

export const DateInput = (props) => <DateTimePicker {...props} mode="date" />;
export const TimeInput = (props) => <DateTimePicker {...props} mode="time" />;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: SPACING.lg },
  modal: { backgroundColor: COLORS.surface, borderRadius: 16, padding: SPACING.lg },
  title: { fontSize: FONT_SIZE.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.md, textAlign: "center" },
  monthNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  navArrow: { fontSize: 20, color: COLORS.primary, padding: SPACING.sm },
  monthLabel: { fontSize: FONT_SIZE.lg, fontWeight: "700", color: COLORS.text },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekDay: { flex: 1, textAlign: "center", fontSize: FONT_SIZE.xs, fontWeight: "600", color: COLORS.secondary, paddingVertical: 4 },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: SPACING.md },
  dayCell: { width: "14.28%", aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 8 },
  dayEmpty: { backgroundColor: "transparent" },
  daySelected: { backgroundColor: COLORS.primary },
  dayDisabled: { opacity: 0.3 },
  dayText: { fontSize: FONT_SIZE.sm, fontWeight: "600", color: COLORS.text },
  dayTextSelected: { color: "#fff" },
  dayTextDisabled: { color: COLORS.textLight },
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: SPACING.lg },
  timeList: { height: 200, width: 80 },
  timeListContent: { paddingVertical: 4 },
  timeItem: { padding: SPACING.sm, alignItems: "center", borderRadius: 8, marginVertical: 2 },
  timeItemActive: { backgroundColor: COLORS.primary },
  timeItemText: { fontSize: FONT_SIZE.lg, fontWeight: "600", color: COLORS.text },
  timeItemTextActive: { color: "#fff" },
  timeSep: { fontSize: 32, fontWeight: "700", color: COLORS.text, marginHorizontal: SPACING.sm, marginTop: -80 },
  timeBtns: { flexDirection: "row", gap: SPACING.md },
  pickerBtn: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.sm },
  pickerText: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text },
  pickerPlaceholder: { color: COLORS.textLight },
  pickerArrow: { fontSize: 10, color: COLORS.secondary, marginLeft: 4 },
});
